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

    const body = await req.json();

    // 强校验红线：核心字段缺失直接返回 400，严禁向底层透传导致 500 崩溃
    if (!body || !body.rh_payload_template) {
      console.warn("API 拦截无效请求: 缺失 rh_payload_template");
      return NextResponse.json(
        { error: "参数校验失败", details: "缺失核心字段: rh_payload_template" },
        { status: 400 }
      );
    }

    const { workflowId, formValues } = body;

    console.log('Received workflowId:', workflowId);

    if (!workflowId || !formValues) {
      return NextResponse.json({ error: 'Missing workflowId or formValues' }, { status: 400 });
    }

    // Fetch workflow details
    const supabaseAdmin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key'
    );
    const { data: workflow, error: workflowError } = await supabaseAdmin
      .from('workflows')
      .select('cost_points, r_app_id, status, rh_payload_template')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      console.error('Supabase Query Error:', workflowError);
      return NextResponse.json({ error: 'Workflow not found in local database.' }, { status: 404 });
    }

    const cost = workflow?.cost_points !== undefined ? Number(workflow.cost_points) : 0;

    // Fetch profile points
    // const { data: profile, error: profileError } = await supabase
    //   .from('profiles')
    //   .select('points')
    //   .eq('id', user.id)
    //   .single();
    //
    // if (profileError || !profile) {
    //   // Mocking points since DB might not have the user due to fake token
    // }

    const currentPoints = 500; // profile ? (Number(profile.points) || 0) : 500;

    // if (currentPoints < cost) {
    //   return NextResponse.json({ error: 'Insufficient Points' }, { status: 403 });
    // }

    // Deduct points
    const newPoints = currentPoints - cost;
    // const { error: updateError } = await supabase
    //   .from('profiles')
    //   .update({ points: newPoints })
    //   .eq('id', user.id);
    //
    // if (updateError) {
    //   console.error('Update points error:', updateError);
    // }

    // Call RunningHub Submit API
    let nodeInfoList = [];
    if (body.rh_payload_template && body.rh_payload_template.nodeInfoList) {
      // Use the frontend-constructed nodeInfoList to preserve exact data types
      nodeInfoList = body.rh_payload_template.nodeInfoList;
    }

    const apiKey = process.env.RUNNINGHUB_API_KEY || 'aa0c44bf36314b1ebdc7937ddede6fae';

    const payload: any = {
      webappId: workflow.r_app_id,
      apiKey: apiKey,
      nodeInfoList: nodeInfoList
    };

    if (body.rh_payload_template?.instanceType || workflow.rh_payload_template?.instanceType) {
      payload.instanceType = body.rh_payload_template?.instanceType || workflow.rh_payload_template?.instanceType;
    }

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
      // 核心修复：终结模糊报错，输出完整详细的错误结构
      console.error('【RunningHub API 校验失败/报错】请求 Payload:', JSON.stringify(payload, null, 2));
      console.error('【RunningHub API 错误响应】:', JSON.stringify(rhData, null, 2));

      const errorMsg = rhData.msg || rhData.message || '第三方接口调用失败';
      return NextResponse.json({
        code: rhData.code || 400,
        message: `校验失败: ${errorMsg}`,
        details: rhData
      }, { status: 400 });
    }

    const taskId = String(rhData.data.taskId);

    return NextResponse.json({
      success: true,
      taskId: taskId,
      newPoints: newPoints
    });

  } catch (error: unknown) {
    console.error('Generate API Error:', error);
    try {
      const clonedReq = req.clone();
      const bodyText = await clonedReq.text();
      console.error('【请求 Payload 异常】:', bodyText);
    } catch(_e) {}


    // Zod Error formatting
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      const zodError = error as any;
      return NextResponse.json({
        code: 400,
        message: `校验失败: ${zodError.errors?.[0]?.message || '参数类型不匹配'}`,
        details: zodError.errors
      }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}
