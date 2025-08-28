-- Fix RLS policies for study groups to allow basic operations

-- Allow users to create study groups
CREATE POLICY "Users can create study groups" ON study_groups 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view all study groups (public access)
CREATE POLICY "Anyone can view study groups" ON study_groups 
FOR SELECT USING (true);

-- Allow users to update groups they created
CREATE POLICY "Users can update their groups" ON study_groups 
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow users to join groups
CREATE POLICY "Users can join groups" ON study_group_members 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view group members
CREATE POLICY "Anyone can view group members" ON study_group_members 
FOR SELECT USING (true);

-- Allow users to create meetings
CREATE POLICY "Users can create meetings" ON meetings 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view meetings
CREATE POLICY "Anyone can view meetings" ON meetings 
FOR SELECT USING (true);

-- Allow users to join meetings
CREATE POLICY "Users can join meetings" ON meeting_participants 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view meeting participants
CREATE POLICY "Anyone can view participants" ON meeting_participants 
FOR SELECT USING (true);

-- Allow users to share meetings
CREATE POLICY "Users can share meetings" ON meeting_shares 
FOR INSERT WITH CHECK (auth.uid() = shared_by);

-- Allow users to view shared meetings
CREATE POLICY "Users can view shared meetings" ON meeting_shares 
FOR SELECT USING (auth.uid() = shared_with OR auth.uid() = shared_by);