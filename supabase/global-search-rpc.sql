-- Drop the existing type and function if they exist, to ensure a clean setup.
DROP FUNCTION IF EXISTS public.global_search(text);
DROP TYPE IF EXISTS public.global_search_result;

-- Create a composite type to define the structure of the returned results.
CREATE TYPE public.global_search_result AS (
    id uuid,
    type text,
    title text,
    subtitle text,
    avatar text,
    rank real
);

-- Create the RPC function for global full-text search.
CREATE OR REPLACE FUNCTION public.global_search(p_search_term text)
RETURNS SETOF public.global_search_result
LANGUAGE plpgsql
AS $$
BEGIN
    -- Ensure the search term is not empty
    IF p_search_term = '' THEN
        RETURN;
    END IF;

    -- Union all search results and order by rank
    RETURN QUERY
    SELECT * FROM (
        -- Search profiles
        SELECT
            p.id,
            'user'::text,
            p.full_name,
            '@' || p.username,
            p.avatar_url,
            ts_rank(to_tsvector('english', p.username || ' ' || p.full_name), websearch_to_tsquery('english', p_search_term)) as rank
        FROM public.profiles p
        WHERE to_tsvector('english', p.username || ' ' || p.full_name) @@ websearch_to_tsquery('english', p_search_term)

        UNION ALL

        -- Search posts
        SELECT
            po.id,
            'post'::text,
            po.content,
            'Post by ' || u.username,
            u.avatar_url,
            ts_rank(to_tsvector('english', po.content), websearch_to_tsquery('english', p_search_term)) as rank
        FROM public.posts po
        JOIN public.profiles u ON po.user_id = u.id
        WHERE to_tsvector('english', po.content) @@ websearch_to_tsquery('english', p_search_term)

        UNION ALL

        -- Search marketplace items
        SELECT
            m.id,
            'marketplace'::text,
            m.title,
            '$' || m.price::text,
            (m.images[1]),
            ts_rank(to_tsvector('english', m.title || ' ' || m.description), websearch_to_tsquery('english', p_search_term)) as rank
        FROM public.marketplace_items m
        WHERE m.is_available = true AND to_tsvector('english', m.title || ' ' || m.description) @@ websearch_to_tsquery('english', p_search_term)
    ) as search_results
    ORDER BY rank DESC
    LIMIT 15;
END;
$$;
