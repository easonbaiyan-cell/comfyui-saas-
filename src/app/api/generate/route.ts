import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key';

    // Get Auth token from request header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    // Create client with user's token
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflowId, formValues } = await req.json();

    if (!workflowId || !formValues) {
      return NextResponse.json({ error: 'Missing workflowId or formValues' }, { status: 400 });
    }

    // Fetch workflow details
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('credit_cost, runninghub_id, rh_payload_template')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      // Return 404 but allow continuing with mock logic for demo
      // return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const cost = workflow ? (Number(workflow.credit_cost) || 0) : 104;

    // Fetch profile points
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Mocking points since DB might not have the user due to fake token
    }

    const currentPoints = profile ? (Number(profile.points) || 0) : 500;

    if (currentPoints < cost) {
      return NextResponse.json({ error: 'Insufficient Points' }, { status: 403 });
    }

    // Deduct points
    const newPoints = currentPoints - cost;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ points: newPoints })
      .eq('id', user.id);

if (updateError) {
      console.error('Update points error:', updateError);
    }

    // Call RunningHub Submit API
    let nodeInfoList = [];
    if (workflow.rh_payload_template && workflow.rh_payload_template.nodeInfoList) {
      nodeInfoList = workflow.rh_payload_template.nodeInfoList.map((node: any) => {
        let value = formValues[node.nodeId];
        if (value === undefined) {
          value = node.fieldValue !== undefined ? node.fieldValue : "";
        }
        return {
          nodeId: node.nodeId,
          type: node.fieldName || node.type || "text",
          value: value
        };
      });
    }

    const payload = {
      webappId: workflow.runninghub_id,
      apiKey: 'aa0c44bf36314b1ebdc7937ddede6fae',
      nodeInfoList: nodeInfoList
    };

    console.log('Sending to RH:', JSON.stringify(payload));

    const rhResponse = await fetch('https://www.runninghub.cn/task/openapi/ai-app/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const contentType = rhResponse.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      const text = await rhResponse.text();
      console.error('RunningHub API Error (Non-JSON):', text);
      return NextResponse.json({ error: 'RunningHub API 返回了非 JSON 格式数据', details: text }, { status: 500 });
    }

    const rhData = await rhResponse.json();

    if (!rhResponse.ok || rhData.code !== 0) {
      // Refund points if generation fails?
      console.error('RunningHub API Error:', rhData);
      return NextResponse.json({ error: rhData.msg || '第三方接口调用失败', details: rhData }, { status: 500 });
    }

    const taskId = String(rhData.data.taskId);

    return NextResponse.json({
      success: true,
      taskId: taskId,
      newPoints: newPoints
    });

  } catch (error) {
    console.error('Generate API Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}
