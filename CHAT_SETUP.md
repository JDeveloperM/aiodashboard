# Real-time Chat Setup Guide

This guide will help you set up the real-time chat feature in your application using Supabase.

## Database Setup

### Step 1: Create the Database Schema

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/cwhhtzbuwzigehpaokqi
2. Navigate to the **SQL Editor** in the left sidebar
3. Create a new query and paste the contents of `supabase/schema.sql`
4. Run the query to create the necessary tables and policies

### Step 2: Enable Realtime

1. In your Supabase dashboard, go to **Database** > **Replication**
2. Make sure the `chat_messages` table is enabled for realtime
3. If it's not listed, the schema.sql should have added it automatically

### Step 3: Verify Setup

You can verify the setup by running this query in the SQL Editor:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('chat_messages', 'friend_requests', 'friendships');

-- Check if realtime is enabled
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Test friend request functionality
SELECT * FROM friend_requests LIMIT 5;
SELECT * FROM friendships LIMIT 5;

-- Check constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name IN ('friend_requests', 'friendships');
```

### Step 4: Debug Friend Requests (Optional)

If you want to debug the friend request system, you can temporarily add the debug component:

1. Import the debug component in any page:
```tsx
import { FriendRequestDebug } from '@/components/debug/friend-request-debug'
```

2. Add it to your page:
```tsx
<FriendRequestDebug />
```

This will show you real-time information about friend requests, friendships, and system status.

## Features Implemented

### ✅ Friend Request System
- **Send friend requests**: Users can send friend requests to other users
- **Accept/decline requests**: Users can manage incoming friend requests
- **Real-time notifications**: Friend requests update in real-time
- **Status tracking**: Shows pending, accepted, or declined status

### ✅ Private Chat Integration
- **Friend-only messaging**: Private chats only available between friends
- **Friend request flow**: Message button initiates friend request if not friends
- **Private chat rooms**: Unique chat rooms for each friendship pair
- **Seamless integration**: Works with existing chat system
- **Community page integration**: Tooltip cards now have functional Message and Add Friend buttons
- **Visual status indicators**: Buttons show friend status (Friends ✓, Pending ⏰, Add Friend +)

### ✅ Real-time Chat Widget
- **Twitter-style positioning**: Bottom-right corner floating widget
- **Toggleable interface**: Click to open/close, minimize/restore
- **Unread message counter**: Shows number of new messages when minimized/closed
- **Responsive design**: Works on desktop and mobile

### ✅ Real-time Messaging
- **Instant message delivery**: Messages appear immediately for all users
- **Message persistence**: All messages are stored in Supabase database
- **User identification**: Shows usernames and avatars from your Sui auth system
- **Connection status**: Shows online/offline status

### ✅ UI/UX Features
- **Message grouping**: Groups consecutive messages from same user
- **Timestamps**: Shows message time for each group
- **Auto-scroll**: Automatically scrolls to newest messages
- **Typing indicators**: Visual feedback while sending messages
- **Error handling**: Graceful error handling with user feedback

### ✅ Integration
- **Sui Auth Integration**: Uses your existing Sui wallet authentication
- **Theme Consistency**: Matches your app's blue theme and styling
- **Performance Optimized**: Efficient real-time subscriptions and message loading

## Usage

The chat widget will automatically appear for authenticated users. Users can:

1. **Open Chat**: Click the floating message icon in bottom-right corner
2. **Send Messages**: Type and press Enter or click Send button
3. **Minimize**: Click the minimize button to reduce to header bar
4. **Close**: Click the X button to completely close the chat
5. **View Unread**: Unread message count shows on minimized/closed states

## Configuration

### Environment Variables
Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cwhhtzbuwzigehpaokqi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Customization Options

You can customize the chat by modifying:

- **Room Names**: Change `roomName="global"` in `FloatingChatWidget` for different chat rooms
- **Styling**: Modify colors and styles in the chat components
- **Message Limits**: Adjust the message loading limit in `useRealtimeChat`
- **Auto-cleanup**: Enable the cleanup trigger in `schema.sql` for automatic old message removal

## Security

The chat implements Row Level Security (RLS) with the following policies:
- All authenticated users can read messages
- All authenticated users can send messages
- Messages are tied to user IDs from your Sui auth system

## Troubleshooting

### Chat Not Loading
1. Check browser console for errors
2. Verify Supabase credentials in `.env.local`
3. Ensure database schema is properly created

### Messages Not Appearing
1. Check if realtime is enabled for `chat_messages` table
2. Verify RLS policies are correctly set
3. Check network connectivity

### Connection Issues
1. Verify Supabase project URL and API key
2. Check if user is properly authenticated
3. Look for CORS or network blocking issues

## Next Steps

The chat is now fully functional! You can extend it by:

- Adding emoji support
- Implementing message reactions
- Adding file/image sharing
- Creating multiple chat rooms
- Adding admin moderation features
- Implementing message search
- Adding user mentions (@username)

## Support

If you encounter any issues, check:
1. Browser developer console for errors
2. Supabase dashboard logs
3. Network tab for failed requests
