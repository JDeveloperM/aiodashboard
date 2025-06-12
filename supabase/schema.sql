-- Create the chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    room_name TEXT NOT NULL DEFAULT 'global',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_name ON public.chat_messages(room_name);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow all authenticated users to read messages
CREATE POLICY "Allow authenticated users to read messages" ON public.chat_messages
    FOR SELECT USING (true);

-- Allow all authenticated users to insert their own messages
CREATE POLICY "Allow authenticated users to insert messages" ON public.chat_messages
    FOR INSERT WITH CHECK (true);

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Optional: Create a function to clean up old messages (keep last 1000 messages per room)
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void AS $$
BEGIN
    DELETE FROM public.chat_messages
    WHERE id NOT IN (
        SELECT id FROM public.chat_messages
        WHERE room_name = 'global'
        ORDER BY created_at DESC
        LIMIT 1000
    ) AND room_name = 'global';
END;
$$ LANGUAGE plpgsql;

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_avatar TEXT,
    receiver_id TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    receiver_avatar TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- Create indexes for friend_requests
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_id ON public.friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_id ON public.friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON public.friend_requests(status);

-- Create friendships table (for accepted friend requests)
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id TEXT NOT NULL,
    user1_name TEXT NOT NULL,
    user1_avatar TEXT,
    user2_id TEXT NOT NULL,
    user2_name TEXT NOT NULL,
    user2_avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Create indexes for friendships
CREATE INDEX IF NOT EXISTS idx_friendships_user1_id ON public.friendships(user1_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user2_id ON public.friendships(user2_id);

-- Enable RLS for friend_requests
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for friend_requests (simplified for now)
CREATE POLICY "Allow all authenticated users to view friend requests" ON public.friend_requests
    FOR SELECT USING (true);

CREATE POLICY "Allow all authenticated users to send friend requests" ON public.friend_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update friend requests" ON public.friend_requests
    FOR UPDATE USING (true);

-- Enable RLS for friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Create policies for friendships (simplified for now)
CREATE POLICY "Allow all authenticated users to view friendships" ON public.friendships
    FOR SELECT USING (true);

CREATE POLICY "Allow all authenticated users to create friendships" ON public.friendships
    FOR INSERT WITH CHECK (true);

-- Enable realtime for friend_requests and friendships
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;

-- Create function to set user context for RLS
CREATE OR REPLACE FUNCTION set_config(setting_name text, setting_value text)
RETURNS void AS $$
BEGIN
    PERFORM set_config(setting_name, setting_value, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a trigger to automatically cleanup old messages
-- (Uncomment if you want automatic cleanup)
-- CREATE OR REPLACE FUNCTION trigger_cleanup_old_messages()
-- RETURNS trigger AS $$
-- BEGIN
--     -- Only run cleanup occasionally (1% chance)
--     IF random() < 0.01 THEN
--         PERFORM cleanup_old_messages();
--     END IF;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
