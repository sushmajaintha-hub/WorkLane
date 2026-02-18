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

    const { job_id } = await req.json();

    if (!job_id) {
      return new Response(
        JSON.stringify({ error: 'Job ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('client_id, budget, title, hired_freelancer_id, status')
      .eq('id', job_id)
      .maybeSingle();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (job.client_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Only the job owner can initiate payment' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (job.status !== 'completed') {
      return new Response(
        JSON.stringify({ error: 'Payment can only be made for completed jobs' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!job.hired_freelancer_id) {
      return new Response(
        JSON.stringify({ error: 'No freelancer hired for this job' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const platformFeePercentage = 0.1;
    const totalAmount = job.budget;
    const platformFee = totalAmount * platformFeePercentage;
    const freelancerPayout = totalAmount - platformFee;

    const paymentData = {
      job_id,
      client_id: user.id,
      freelancer_id: job.hired_freelancer_id,
      amount: totalAmount,
      platform_fee: platformFee,
      freelancer_payout: freelancerPayout,
      razorpay_order_id: `order_${Date.now()}`,
      amount_in_paise: Math.round(totalAmount * 100),
      currency: 'INR',
      description: `Payment for job: ${job.title}`,
      customer_name: '', // To be filled from profile
      customer_email: '', // To be filled from profile
    };

    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    const { data: authUser } = await supabase.auth.admin.getUserById(user.id);

    if (clientProfile && authUser?.user) {
      paymentData.customer_name = clientProfile.full_name;
      paymentData.customer_email = authUser.user.email || '';
    }

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        job_id,
        client_id: user.id,
        freelancer_id: job.hired_freelancer_id,
        amount: totalAmount,
        platform_fee: platformFee,
        freelancer_payout: freelancerPayout,
        status: 'pending',
      })
      .select()
      .single();

    if (txError) {
      return new Response(JSON.stringify({ error: txError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      transaction_id: transaction.id,
      payment_data: {
        amount: paymentData.amount_in_paise,
        currency: paymentData.currency,
        description: paymentData.description,
        customer_name: paymentData.customer_name,
        customer_email: paymentData.customer_email,
      },
      message: 'Payment prepared successfully. Ready for Razorpay integration.',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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
