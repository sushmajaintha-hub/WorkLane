import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { bid_id } = await req.json();

    if (!bid_id) {
      return new Response(
        JSON.stringify({ error: 'Bid ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .select('job_id, freelancer_id, amount')
      .eq('id', bid_id)
      .maybeSingle();

    if (bidError || !bid) {
      return new Response(JSON.stringify({ error: 'Bid not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('client_id, status')
      .eq('id', bid.job_id)
      .maybeSingle();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (job.client_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Only the job owner can hire' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (job.status !== 'open') {
      return new Response(
        JSON.stringify({ error: 'Job is no longer open for hiring' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { error: updateJobError } = await supabase
      .from('jobs')
      .update({
        status: 'in_progress',
        hired_freelancer_id: bid.freelancer_id,
      })
      .eq('id', bid.job_id);

    if (updateJobError) {
      return new Response(JSON.stringify({ error: updateJobError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: acceptBidError } = await supabase
      .from('bids')
      .update({ status: 'accepted' })
      .eq('id', bid_id);

    if (acceptBidError) {
      return new Response(JSON.stringify({ error: acceptBidError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: rejectOthersError } = await supabase
      .from('bids')
      .update({ status: 'rejected' })
      .eq('job_id', bid.job_id)
      .neq('id', bid_id);

    if (rejectOthersError) {
      console.error('Error rejecting other bids:', rejectOthersError);
    }

    const { data: freelancerProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', bid.freelancer_id)
      .maybeSingle();

    await supabase
      .from('notifications')
      .insert({
        user_id: bid.freelancer_id,
        type: 'bid_accepted',
        title: 'Your Bid Was Accepted!',
        message: 'Congratulations! Your bid has been accepted. Start working on the project.',
        related_job_id: bid.job_id,
        related_bid_id: bid_id,
      });

    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', job.client_id)
      .maybeSingle();

    const { data: rejectedBids } = await supabase
      .from('bids')
      .select('freelancer_id')
      .eq('job_id', bid.job_id)
      .eq('status', 'rejected');

    if (rejectedBids) {
      for (const rejectedBid of rejectedBids) {
        if (rejectedBid.freelancer_id !== bid.freelancer_id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: rejectedBid.freelancer_id,
              type: 'bid_accepted',
              title: 'Bid Not Selected',
              message: `Your bid for "${job.status}" was not selected. Keep trying!`,
              related_job_id: bid.job_id,
            });
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Freelancer hired successfully',
        job_id: bid.job_id,
        freelancer_id: bid.freelancer_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
