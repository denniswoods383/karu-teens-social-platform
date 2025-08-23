-- Enable realtime for group_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;

-- Update RLS policy to allow realtime subscriptions
DROP POLICY IF EXISTS "group_messages_select" ON group_messages;
CREATE POLICY "group_messages_select" ON group_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM study_group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
);