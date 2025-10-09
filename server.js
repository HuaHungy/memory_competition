const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
// 移除 Hugging Face 依赖
// const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

// 移除 Hugging Face 实例化
// const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// 通用提示词片段（统一质量与负面约束）
const QUALITY_PROMPT = '温馨而充满回忆感的手绘插画，柔和的光线洒在画面中，色调温暖细腻，氛围安静而治愈。画面仿佛定格在一段珍贵的记忆中，让人感受到熟悉的温度与情感。主体清晰且富有故事感，线条柔和，色彩协调，光影自然。整体风格细腻、干净、具有高级的插画质感与温暖的情绪表达。';
const NEGATIVE_PROMPT = '低质量, 模糊, 过曝, 噪点, 畸变, 透视错误, 过度锐化, 涂抹痕迹, 多余手指, 断肢, 文字, 水印, 标志, 拼贴感, 画面拥挤, 比例失衡, 面部扭曲, 伪影, 眩光';
const ILLUSTRATION_STYLE_PROMPT = '温馨而充满回忆感的手绘插画，柔和的光线洒在画面中，色调温暖细腻，氛围安静而治愈。画面仿佛定格在一段珍贵的记忆中，让人感受到熟悉的温度与情感。主体清晰且富有故事感，线条柔和，色彩协调，光影自然。整体风格细腻、干净、具有高级的插画质感与温暖的情绪表达。';

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname)));

// 文本润色API
app.post('/api/polish', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: '请提供要润色的文本'
            });
        }

        // 模拟文本润色处理
        const polishedResult = await polishText(text);
        
        res.json({
            success: true,
            polishedText: polishedResult.polished,
            moodAnalysis: {
                mood: polishedResult.mood,
                description: polishedResult.moodDescription,
                emoji: getMoodEmoji(polishedResult.mood)
            }
        });
        
    } catch (error) {
        console.error('文本润色错误:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

// 图片生成API
app.post('/api/generate-image', async (req, res) => {
    try {
        const { text, mood, count } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: '请提供文本内容'
            });
        }

        // 生成图片处理（仅生成式AI + 回退模拟）
        const result = await generateImages(text, mood, Number(count) || 3);
        
        res.json({
            success: true,
            images: result.images || result
        });
        
    } catch (error) {
        console.error('图片生成错误:', error);
        res.status(500).json({
            success: false,
            error: '图片生成失败'
        });
    }
});

// 健康检查API
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '服务运行正常',
        timestamp: new Date().toISOString()
    });
});

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 真实的文本润色功能（使用国内免费AI服务）
async function polishText(text) {
  try {
    // 调试信息：检查API密钥配置
    console.log('API密钥配置状态:');
    console.log('- 智谱AI:', process.env.ZHIPU_API_KEY ? '已配置' : '未配置');
    console.log('- 通义千问:', process.env.DASHSCOPE_API_KEY ? '已配置' : '未配置');

    // 优先使用智谱AI（推荐，免费额度大）
    if (process.env.ZHIPU_API_KEY && process.env.ZHIPU_API_KEY !== 'your_zhipu_api_key_here') {
      try {
        console.log('尝试使用智谱AI进行文本润色...');
        const aiResult = await polishTextWithZhipu(text);
        console.log('智谱AI润色成功');
        return aiResult;
      } catch (error) {
        console.log('智谱AI调用失败:', error.message);
        console.log('错误详情:', error.response?.data || error);
      }
    } else {
      console.log('智谱AI API密钥未配置或为默认值');
    }

    // 备用：尝试通义千问
    if (process.env.DASHSCOPE_API_KEY && process.env.DASHSCOPE_API_KEY !== 'your_dashscope_api_key_here') {
      try {
        console.log('尝试使用通义千问进行文本润色...');
        const aiResult = await polishTextWithDashScope(text);
        console.log('通义千问润色成功');
        return aiResult;
      } catch (error) {
        console.log('通义千问调用失败:', error.message);
        console.log('错误详情:', error.response?.data || error);
      }
    } else {
      console.log('通义千问API密钥未配置或为默认值');
    }

    // 如果大模型API都不可用，回退到本地智能润色
    console.log('大模型API不可用，使用本地智能润色...');
    const localResult = polishTextSmart(text);
    return localResult;

   } catch (error) {
     console.error('文本润色失败:', error.message);
     console.log('回退到基础润色');
     return polishTextBasic(text);
   }
 }

// 使用智谱AI进行文本润色（推荐，免费额度大）
async function polishTextWithZhipu(text) {
  try {
    console.log('正在调用智谱AI API...');
    const response = await axios.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      model: "glm-4-flash",
      messages: [
        {
          role: "system",
          content: "你是一位具有诗意灵魂的中文文学润色师。请将以下文本打磨得更加优美细腻、饱含情感与画面感，让读者能从字里行间感受到情绪的波动与温度。你可以适度扩写，增加内心描写、氛围刻画与意象铺陈，使整体文字更具文学美感与情绪深度。必须严格按长度要求输出：润色正文不少于400字；情绪分析段落不少于200字。用中文回复。"
        },
        {
          role: "user",
          content: `请润色以下文本，并分析其情感基调。要求：\n1) 润色后的正文不少于400字；\n2) 情绪分析为一段连贯文字，不少于200字；\n3) 语言自然细腻，有画面感。\n\n【待润色文本】\n${text}\n\n请严格按以下格式输出：\n润色后的文本：[正文，不少于400字]\n情感分析：[不少于200字，包含情绪关键词（如温馨/怀念/快乐等）与简短理由]`
        }
      ],
      max_tokens: 1200,
      temperature: 0.7,
      top_p: 0.7  // 显式设置top_p参数，必须在(0.0, 1.0)开区间内
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.ZHIPU_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000 // 增加超时时间到15秒
    });

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('智谱AI返回数据格式异常');
    }

    const responseText = response.data.choices[0].message.content;
    console.log('智谱AI调用成功，返回内容:', responseText.substring(0, 100) + '...');
    
    // 解析回复
    const polishedMatch = responseText.match(/润色后的文本：(.+?)(?=\n情感分析：|$)/s);
    const moodMatch = responseText.match(/情感分析：(.+?)$/s);
    
    const polishedText = polishedMatch ? polishedMatch[1].trim() : text;
    const mood = moodMatch ? moodMatch[1].trim() : '温馨';

    return {
       polished: polishedText,
       mood: mood,
       moodDescription: getMoodDescription(mood),
       timestamp: new Date().toISOString(),
       source: '智谱AI'
     };

   } catch (error) {
     console.error('智谱AI调用详细错误:', {
       message: error.message,
       status: error.response?.status,
       statusText: error.response?.statusText,
       data: error.response?.data
     });
     throw error;
   }
}

// 使用通义千问进行文本润色
async function polishTextWithDashScope(text) {
  try {
    console.log('正在调用通义千问API...');
    const response = await axios.post('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      model: "qwen-turbo",
      input: {
        messages: [
          {
            role: "system",
            content: "你是专业的中文文本润色助手。请润色文本并输出情绪分析。必须严格满足：润色正文不少于400字；情绪分析段落不少于200字。"
          },
          {
            role: "user",
            content: `请润色以下文本，并分析其情感基调。要求：\n1) 润色后的正文不少于400字；\n2) 情绪分析为一段连贯文字，不少于200字；\n3) 语言自然细腻，有画面感。\n\n【待润色文本】\n${text}\n\n请严格按以下格式输出：\n润色后的文本：[正文，不少于400字]\n情感分析：[不少于200字，包含情绪关键词（如温馨/怀念/快乐等）与简短理由]`
          }
        ]
      },
      parameters: {
        max_tokens: 1200,
        temperature: 0.7
      }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000 // 增加超时时间
    });

    if (!response.data || !response.data.output || !response.data.output.text) {
      throw new Error('通义千问返回数据格式异常');
    }

    const responseText = response.data.output.text;
    console.log('通义千问API调用成功，返回内容:', responseText.substring(0, 100) + '...');
    
    // 解析回复
    const polishedMatch = responseText.match(/润色后的文本：(.+?)(?=\n情感分析：|$)/s);
    const moodMatch = responseText.match(/情感分析：(.+?)$/s);
    
    const polishedText = polishedMatch ? polishedMatch[1].trim() : text;
    const mood = moodMatch ? moodMatch[1].trim() : '温馨';

    return {
       polished: polishedText,
       mood: mood,
       moodDescription: getMoodDescription(mood),
       timestamp: new Date().toISOString(),
       source: '通义千问API'
     };

   } catch (error) {
     console.error('通义千问API调用详细错误:', {
       message: error.message,
       status: error.response?.status,
       statusText: error.response?.statusText,
       data: error.response?.data
     });
     throw error;
   }
}

// 获取情感描述
function getMoodDescription(mood) {
    const moodDescriptions = {
        '温馨': '温暖而舒适的感觉，让人感到家的温暖',
        '怀念': '对过去美好时光的眷恋和回忆',
        '快乐': '充满喜悦和欢乐的情感',
        '宁静': '平和安详的心境，远离喧嚣',
        '感动': '触动心灵的深刻情感体验',
        '希望': '对未来充满期待和憧憬',
        '忧伤': '淡淡的哀愁和不舍',
        '激动': '兴奋而充满活力的状态'
    };
    
    return moodDescriptions[mood] || '温暖美好的情感';
}

// 获取情感对应的emoji
function getMoodEmoji(mood) {
    const moodEmojis = {
        '温馨': '🏠',
        '怀念': '💭',
        '快乐': '😊',
        '宁静': '🌸',
        '感动': '💖',
        '希望': '🌟',
        '忧伤': '🌧️',
        '激动': '🎉'
    };
    
    return moodEmojis[mood] || '💝';
}

// 分析文本情感
function analyzeMoodFromText(text) {
    const moodKeywords = {
        '温馨': ['家', '温暖', '舒适', '陪伴', '拥抱', '关爱', '呵护'],
        '怀念': ['回忆', '过去', '曾经', '那时', '想起', '记得', '往昔'],
        '快乐': ['开心', '高兴', '快乐', '欢乐', '笑', '喜悦', '兴奋'],
        '宁静': ['安静', '平静', '宁静', '祥和', '静谧', '安详', '悠然'],
        '感动': ['感动', '触动', '震撼', '感激', '泪水', '心动', '温情'],
        '希望': ['希望', '未来', '梦想', '期待', '憧憬', '光明', '前进'],
        '忧伤': ['难过', '伤心', '忧伤', '失落', '孤独', '思念', '离别']
    };
    
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return mood;
        }
    }
    
    return '温馨'; // 默认情感
}

// 智能文本润色（本地处理）
function polishTextSmart(text) {
    // 分析情感
    const mood = analyzeMoodFromText(text);
    
    // 根据情感添加修饰词
    const moodEnhancements = {
        '温馨': ['温暖的', '舒适的', '温馨的', '柔和的'],
        '怀念': ['珍贵的', '难忘的', '美好的', '深刻的'],
        '快乐': ['欢乐的', '愉快的', '开心的', '美妙的'],
        '宁静': ['安静的', '平和的', '宁静的', '祥和的'],
        '感动': ['感人的', '温情的', '动人的', '真挚的'],
        '希望': ['充满希望的', '光明的', '美好的', '积极的'],
        '忧伤': ['淡淡的', '轻柔的', '深情的', '细腻的']
    };
    
    let polished = text;
    
    // 简单的文本增强
    const enhancements = moodEnhancements[mood] || moodEnhancements['温馨'];
    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    
    // 如果文本较短，添加一些修饰
    if (text.length < 50) {
        polished = `${randomEnhancement}${text}，让人感受到${getMoodDescription(mood)}。`;
    } else {
        // 对较长文本进行简单的句式调整
        polished = text.replace(/。/g, `，${randomEnhancement}。`);
    }
    
    return {
        polished: polished,
        mood: mood,
        moodDescription: getMoodDescription(mood),
        timestamp: new Date().toISOString(),
        source: '本地智能润色'
    };
}

// 基础文本润色（最后的回退选项）
function polishTextBasic(text) {
    const mood = '温馨';
    return {
        polished: `${text}，这是一段温暖的回忆。`,
        mood: mood,
        moodDescription: getMoodDescription(mood),
        timestamp: new Date().toISOString(),
        source: '基础润色'
    };
}
// 真实的图片生成功能（仅生成式AI + 回退模拟）
async function generateImages(text, mood, count = 3) {
  try {
    // 优先：阿里云通义万相（生成式）
    if (process.env.DASHSCOPE_API_KEY && 
        process.env.DASHSCOPE_API_KEY !== 'your_dashscope_api_key_here' &&
        process.env.DASHSCOPE_API_KEY.startsWith('sk-')) {
      console.log('🎯 使用阿里云通义万相生成图片...');
      return await generateImagesWithDashScope(text, mood, count);
    } else {
      console.log('阿里云通义万相 API密钥未正确配置');
    }

    // 次选：百度文心一格（生成式）
    if (process.env.BAIDU_API_KEY && 
        process.env.BAIDU_SECRET_KEY &&
        process.env.BAIDU_API_KEY !== 'your_baidu_api_key_here' &&
        process.env.BAIDU_SECRET_KEY !== 'your_baidu_secret_key_here') {
      console.log('🎨 使用百度文心一格生成图片...');
      return await generateImagesWithBaidu(text, mood, count);
    } else {
      console.log('百度文心一格 API密钥未正确配置');
    }

    // 回退：模拟数据
    console.log('📷 所有生成式图片服务都未配置或不可用，使用模拟数据');
    return generateImagesMock(text, mood, count);

  } catch (error) {
    console.error('图片生成失败:', error.message);
    console.log('📷 回退到模拟数据');
    return generateImagesMock(text, mood, count);
  }
}

// 使用百度文心一格生成图片
async function generateImagesWithBaidu(text, mood, count = 3) {
  const moodPrompts = {
    '温馨': '温馨的家庭场景，柔和的灯光，舒适的家居氛围',
    '怀念': '怀旧复古场景，老照片风格，回忆的色调',
    '快乐': '欢乐的场景，明亮的色彩，庆祝的氛围，微笑的人们',
    '宁静': '宁静的自然风景，平静的湖面，安详的氛围',
    '感动': '感人的瞬间，温暖的场景，真挚的情感',
    '希望': '充满希望的场景，日出，新的开始，积极向上'
  };
  
  const basePrompt = moodPrompts[mood] || '美丽宁静的场景';
  // 将用户文本强制融合，给出明确的画面控制与负面约束
  // 插画风模板：用户文本 + 情感基调 + 插画风格强化 + 质量约束
  const prompt = `根据以下中文描述进行画面创作：${text}。${basePrompt}。${ILLUSTRATION_STYLE_PROMPT} ${QUALITY_PROMPT}`;
  const negativePrompt = NEGATIVE_PROMPT;
  
  try {
    console.log('使用百度文心一格生成图片...');
    
    // 获取百度 Access Token
    const accessToken = await getBaiduAccessToken();
    
    const response = await axios.post(
      `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/text2image/sd_xl?access_token=${accessToken}`,
      {
        prompt: prompt,
        negative_prompt: negativePrompt,
        size: '512x512',
        n: Math.max(1, Math.min(4, count)),
        steps: 20,
        sampler_index: 'Euler a'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      const imageData = response.data.data[0];
      console.log('百度文心一格图片生成成功');
      
      const images = response.data.data.map((img) => ({
        url: `data:image/png;base64,${img.b64_image}`,
        description: `AI生成图片：${prompt}`,
        source: '百度文心一格'
      }));
      return {
        images: images,
        mood: mood,
        timestamp: new Date().toISOString(),
        source: '百度文心一格'
      };
    } else {
      throw new Error('百度API返回数据格式异常');
    }
    
  } catch (error) {
    console.error('百度文心一格API调用失败:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
}

// 获取百度 Access Token
async function getBaiduAccessToken() {
  try {
    const response = await axios.post(
      'https://aip.baidubce.com/oauth/2.0/token',
      null,
      {
        params: {
          grant_type: 'client_credentials',
          client_id: process.env.BAIDU_API_KEY,
          client_secret: process.env.BAIDU_SECRET_KEY
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    if (response.data && response.data.access_token) {
      return response.data.access_token;
    } else {
      throw new Error('获取百度Access Token失败');
    }
  } catch (error) {
    console.error('获取百度Access Token失败:', error.message);
    throw error;
  }
}

// 使用阿里云通义万相生成图片
async function generateImagesWithDashScope(text, mood, count = 3) {
  const moodPrompts = {
    '温馨': '温馨的家庭场景，柔和的灯光，舒适的家居氛围',
    '怀念': '怀旧复古场景，老照片风格，回忆的色调',
    '快乐': '欢乐的场景，明亮的色彩，庆祝的氛围，微笑的人们',
    '宁静': '宁静的自然风景，平静的湖面，安详的氛围',
    '感动': '感人的瞬间，温暖的场景，真挚的情感',
    '希望': '充满希望的场景，日出，新的开始，积极向上'
  };
  
  const basePrompt = moodPrompts[mood] || '美丽宁静的场景';
  // 插画风模板：用户文本 + 情感基调 + 插画风格强化 + 质量约束
  const prompt = `根据以下中文描述进行画面创作：${text}。${basePrompt}。${ILLUSTRATION_STYLE_PROMPT} ${QUALITY_PROMPT}`;
  const negativePrompt = NEGATIVE_PROMPT;
  
  try {
    console.log('使用阿里云通义万相生成图片...');
    console.log('API密钥前缀:', process.env.DASHSCOPE_API_KEY?.substring(0, 10) + '...');
    
    // 创建异步任务
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
      {
        model: 'wanx-v1',
        input: {
          prompt: prompt,
          negative_prompt: negativePrompt
        },
        parameters: {
          style: '<auto>',
          size: '1024*1024',
          n: Math.max(1, Math.min(4, count)),
          seed: Math.floor(Math.random() * 1e9) // 增加随机性
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable'
        },
        timeout: 30000
      }
    );
    
    console.log('任务创建响应:', response.data);
    
    if (response.data && response.data.output && response.data.output.task_id) {
      // 通义万相是异步生成，需要轮询结果
      const taskId = response.data.output.task_id;
      console.log('任务ID:', taskId);
      const imageResults = await pollDashScopeImageResult(taskId);
      console.log('阿里云通义万相图片生成成功');
      return {
        images: imageResults.map(r => ({
          url: r.url,
          description: `AI生成图片：${prompt}`,
          source: '阿里云通义万相'
        })),
        mood: mood,
        timestamp: new Date().toISOString(),
        source: '阿里云通义万相'
      };
    } else {
      throw new Error('阿里云API返回数据格式异常: ' + JSON.stringify(response.data));
    }
    
  } catch (error) {
    console.error('阿里云通义万相API调用失败:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      headers: error.config?.headers
    });
    
    // 如果是API密钥问题，提供详细说明
    if (error.response?.status === 401) {
      console.error('❌ API密钥认证失败，可能的原因:');
      console.error('1. API密钥格式不正确（应该以sk-开头）');
      console.error('2. API密钥已过期或被禁用');
      console.error('3. 未开通通义万相图像生成服务');
      console.error('4. 地域不匹配（需要使用北京地域的密钥）');
      console.error('请检查 .env 文件中的 DASHSCOPE_API_KEY 配置');
    }
    
    throw error;
  }
}

// 轮询阿里云通义万相图片生成结果
async function pollDashScopeImageResult(taskId, maxAttempts = 15) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`检查任务状态 (第${attempt}次)...`);
      
      const response = await axios.get(
        `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`
          }
        }
      );
      
      console.log('任务状态响应:', response.data);
      
      if (response.data && response.data.output) {
        const status = response.data.output.task_status;
        console.log('任务状态:', status);
        
        if (status === 'SUCCEEDED') {
          const results = response.data.output.results;
          if (results && results.length > 0) {
            console.log('图片生成成功，数量:', results.length);
            return results.map(r => ({ url: r.url }));
          } else {
            throw new Error('任务成功但未返回图片结果');
          }
        } else if (status === 'FAILED') {
          const errorMsg = response.data.output.message || '图片生成失败';
          throw new Error(`任务失败: ${errorMsg}`);
        }
        
        // 如果还在处理中，等待后继续轮询
        if (status === 'PENDING' || status === 'RUNNING') {
          console.log(`图片生成中... 等待3秒后继续检查`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // 等待3秒
          continue;
        }
      }
      
    } catch (error) {
      console.error(`轮询图片结果失败 (第${attempt}次):`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (attempt === maxAttempts) {
        throw new Error(`图片生成超时或失败: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  throw new Error('图片生成超时，请稍后重试');
}

// 已移除 Pexels 通道

// 模拟图片生成（回退选项）
function generateImagesMock(text, mood) {
    const moodImages = {
        '温馨': [
            'https://picsum.photos/400/300?random=1',
            'https://picsum.photos/400/300?random=2',
            'https://picsum.photos/400/300?random=3'
        ],
        '怀念': [
            'https://picsum.photos/400/300?random=4',
            'https://picsum.photos/400/300?random=5',
            'https://picsum.photos/400/300?random=6'
        ],
        '快乐': [
            'https://picsum.photos/400/300?random=7',
            'https://picsum.photos/400/300?random=8',
            'https://picsum.photos/400/300?random=9'
        ]
    };
    
    const defaultImages = [
        'https://picsum.photos/400/300?random=10',
        'https://picsum.photos/400/300?random=11',
        'https://picsum.photos/400/300?random=12'
    ];
    
    const imageUrls = moodImages[mood] || defaultImages;
    
    const images = imageUrls.map((url, index) => ({
        url: url,
        description: `${mood}风格的记忆画面 ${index + 1}`,
        source: '模拟数据'
    }));
    
    return images;
}

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        success: false,
        error: '服务器内部错误'
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: '请求的资源不存在'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 记忆回忆服务器已启动`);
    console.log(`📍 本地访问地址: http://localhost:${PORT}`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
    console.log(`🎨 功能特性:`);
    console.log(`   - 文本润色处理（支持国内免费AI）`);
    console.log(`   - 情感分析`);
    console.log(`   - 记忆图片生成`);
    console.log(`   - 温馨界面设计`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在优雅关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到SIGINT信号，正在优雅关闭服务器...');
    process.exit(0);
});