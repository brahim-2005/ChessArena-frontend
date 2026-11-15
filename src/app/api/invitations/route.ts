import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Fetch received pending invitations
    const { data: received, error: receivedError } = await supabase
      .from('game_invitations')
      .select(`
        id, sender_id, receiver_id, game_mode, time_control, selected_color, status, game_id, expires_at, created_at,
        sender:profiles!game_invitations_sender_id_fkey(id, username, full_name, avatar_url, rating)
      `)
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (receivedError) throw receivedError;

    // Fetch sent pending invitations
    const { data: sent, error: sentError } = await supabase
      .from('game_invitations')
      .select(`
        id, sender_id, receiver_id, game_mode, time_control, selected_color, status, game_id, expires_at, created_at,
        receiver:profiles!game_invitations_receiver_id_fkey(id, username, full_name, avatar_url, rating)
      `)
      .eq('sender_id', user.id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (sentError) throw sentError;

    return NextResponse.json({ received: received || [], sent: sent || [] });
  } catch (error) {
    console.error('Fetch game invitations error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load invitations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientUsername, gameMode = 'standard', timeControl = '3+2', selectedColor = 'random' } = body;

    if (!recipientUsername || typeof recipientUsername !== 'string') {
      return NextResponse.json({ error: 'Recipient username is required' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('send_game_invitation', {
      p_recipient_username: recipientUsername.trim(),
      p_game_mode: gameMode,
      p_time_control: timeControl,
      p_selected_color: selectedColor,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Send game invitation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to send invitation' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { invitationId, action } = body;

    if (!invitationId || !['accept', 'decline', 'cancel'].includes(action)) {
      return NextResponse.json({ error: 'Valid invitation ID and action required' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('respond_game_invitation', {
      p_invitation_id: invitationId,
      p_action: action,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Respond game invitation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to process invitation action' },
      { status: 500 }
    );
  }
}
