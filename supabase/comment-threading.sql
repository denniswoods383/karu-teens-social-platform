-- Add parent_id for threaded comments, allowing for nested replies.
-- This column will be a foreign key referencing the 'id' of the parent comment in the same table.
ALTER TABLE public.comments
ADD COLUMN parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- Create an index on the new parent_id column to speed up fetching replies for a given comment.
CREATE INDEX idx_comments_parent_id ON public.comments (parent_id);
