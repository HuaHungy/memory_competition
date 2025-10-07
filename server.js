const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const OpenAI = require('openai');
const axios = require('axios');
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30秒超时
  maxRetries: 3,  // 最多重试3次
});

// 初始化Hugging Face推理客户端
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

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
            mood: polishedResult.mood,
            moodDescription: polishedResult.moodDescription
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
        const { text, mood } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: '请提供文本内容'
            });
        }

        // 模拟图片生成处理
        const images = await generateImages(text, mood);
        
        res.json({
            success: true,
            images: images
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

// 真实的文本润色功能（使用多种AI服务）
async function polishText(text) {
  try {
    // 优先使用本地智能润色（快速、稳定、免费）
    console.log('使用本地智能润色进行文本处理...');
    const localResult = polishTextSmart(text);
    
    // 如果配置了AI API，尝试增强润色效果
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        console.log('尝试使用OpenAI API增强润色效果...');
        const aiResult = await polishTextWithOpenAI(text);
        // 如果AI润色成功，返回AI结果
        return aiResult;
      } catch (error) {
        console.log('OpenAI API调用失败，使用本地润色结果');
      }
    }

    // 返回本地智能润色结果
    return localResult;

   } catch (error) {
     console.error('文本润色失败:', error.message);
     console.log('回退到基础润色');
     return polishTextBasic(text);
   }
 }

// 使用OpenAI进行文本润色（作为增强选项）
async function polishTextWithOpenAI(text) {
  try {
    // 使用Promise.race实现更严格的超时控制
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API调用超时')), 5000); // 5秒超时，快速回退
    });

    const apiPromise = openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个专业的文本润色助手。请帮助用户润色和改进他们的文本，使其更加优美、生动、有感情色彩。同时分析文本的情感基调。请用中文回复。"
        },
        {
          role: "user",
          content: `请润色以下文本，并分析其情感基调：\n\n${text}\n\n请按以下格式回复：\n润色后的文本：[润色后的内容]\n情感分析：[情感基调，如：温馨、怀念、快乐、忧伤等]`
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const completion = await Promise.race([apiPromise, timeoutPromise]);
    const response = completion.choices[0].message.content;
    
    console.log('OpenAI API调用成功');
    
    // 解析OpenAI的回复
    const polishedMatch = response.match(/润色后的文本：(.+?)(?=\n情感分析：|$)/s);
    const moodMatch = response.match(/情感分析：(.+?)$/s);
    
    const polishedText = polishedMatch ? polishedMatch[1].trim() : text;
    const mood = moodMatch ? moodMatch[1].trim() : '温馨';

    return {
       originalText: text,
       polishedText: polishedText,
       mood: mood,
       timestamp: new Date().toISOString(),
       source: 'OpenAI API'
     };

   } catch (error) {
     console.error('OpenAI API调用失败:', error.message);
     throw error; // 让上层函数处理回退
   }
 }

// 基础文本润色（最后的回退选项）
function polishTextBasic(text) {
  // 基础的文本清理和格式化
  let polishedText = text.trim();
  
  // 简单的标点符号优化
  polishedText = polishedText.replace(/\s*[,，]\s*/g, '，');
  polishedText = polishedText.replace(/\s*[.。]\s*/g, '。');
  polishedText = polishedText.replace(/\s*[!！]\s*/g, '！');
  polishedText = polishedText.replace(/\s*[?？]\s*/g, '？');
  
  // 确保不为空
  if (!polishedText || polishedText.length < 2) {
    polishedText = '美好的回忆值得珍藏。';
  }

  return {
    originalText: text,
    polishedText: polishedText,
    mood: '平静',
    timestamp: new Date().toISOString(),
    source: '基础润色'
  };
}

// 简单的情感分析函数
function analyzeMoodFromText(text) {
  const moodKeywords = {
    '温馨': ['家', '温暖', '舒适', '亲情', '爱', '拥抱', '妈妈', '爸爸'],
    '怀念': ['回忆', '过去', '曾经', '那时', '小时候', '童年', '以前'],
    '快乐': ['开心', '高兴', '笑', '快乐', '兴奋', '愉快', '哈哈'],
    '宁静': ['安静', '平静', '宁静', '静谧', '祥和', '安详', '静'],
    '感动': ['感动', '温暖', '眼泪', '心动', '触动', '震撼', '泪'],
    '希望': ['希望', '未来', '梦想', '光明', '美好', '期待', '明天']
  };

  let detectedMood = '温馨';
  let maxMatches = 0;
  
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedMood = mood;
    }
  }

  return detectedMood;
}

 // 智能本地润色功能（改进的备用方案）
 function polishTextSmart(text) {
   // 简单的文本分析和润色
   const moodKeywords = {
     '温馨': ['家', '温暖', '舒适', '亲情', '爱', '拥抱'],
     '怀念': ['回忆', '过去', '曾经', '那时', '小时候', '童年'],
     '快乐': ['开心', '高兴', '笑', '快乐', '兴奋', '愉快'],
     '宁静': ['安静', '平静', '宁静', '静谧', '祥和', '安详'],
     '感动': ['感动', '温暖', '眼泪', '心动', '触动', '震撼'],
     '希望': ['希望', '未来', '梦想', '光明', '美好', '期待']
   };

   // 分析情感
   let detectedMood = '温馨';
   let maxMatches = 0;
   
   for (const [mood, keywords] of Object.entries(moodKeywords)) {
     const matches = keywords.filter(keyword => text.includes(keyword)).length;
     if (matches > maxMatches) {
       maxMatches = matches;
       detectedMood = mood;
     }
   }

   // 简单的文本润色
   let polishedText = text;
   
   // 添加一些润色规则
   const polishRules = [
     { pattern: /我在(.+?)玩/, replacement: '我在$1快乐地玩耍' },
     { pattern: /很开心/, replacement: '心情格外愉悦' },
     { pattern: /很好/, replacement: '非常美好' },
     { pattern: /记得/, replacement: '依然清晰地记得' },
     { pattern: /那时/, replacement: '那个美好的时光里' }
   ];

   polishRules.forEach(rule => {
     polishedText = polishedText.replace(rule.pattern, rule.replacement);
   });

   // 如果没有明显改变，添加一些修饰
   if (polishedText === text) {
     polishedText = `${text}，那份美好的回忆至今还温暖着我的心。`;
   }

   return {
     originalText: text,
     polishedText: polishedText,
     mood: detectedMood,
     timestamp: new Date().toISOString(),
     source: '本地智能润色'
   };
 }

 // 模拟文本润色功能（备用方案）
 function polishTextMock(text) {
   const enhancements = [
     '在温暖的阳光下，',
     '伴随着微风轻抚，',
     '在那个美好的时光里，',
     '带着满心的期待，',
     '在记忆的深处，'
   ];
   
   const moods = ['温馨', '怀念', '快乐', '宁静', '感动', '希望'];
   
   // 模拟处理延迟
   return new Promise((resolve) => {
     setTimeout(() => {
       const enhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
       const mood = moods[Math.floor(Math.random() * moods.length)];
       
       resolve({
         originalText: text,
         polishedText: enhancement + text,
         mood: mood,
         timestamp: new Date().toISOString()
       });
     }, 1000);
   });
 }
// 真实的图片生成功能（使用多种AI服务）
async function generateImages(text, mood) {
  try {
    // 优先使用Hugging Face AI图片生成（免费）
    if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'your_huggingface_token_here') {
      return await generateImagesWithHuggingFace(text, mood);
    }
    
    // 备选：使用Pexels免费图片API
    if (process.env.PEXELS_API_KEY && process.env.PEXELS_API_KEY !== 'your_pexels_api_key_here') {
      return await generateImagesWithPexels(text, mood);
    }
    
    // 如果配置了OpenAI API密钥，尝试使用DALL-E
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      return await generateImagesWithDALLE(text, mood);
    }
    
    // 回退到模拟数据
    console.log('未配置图片生成API密钥，使用模拟数据');
    return generateImagesMock(text, mood);
    
  } catch (error) {
    console.error('图片生成失败:', error.message);
    console.log('回退到模拟数据');
    return generateImagesMock(text, mood);
  }
}

// 使用Hugging Face AI生成图片
async function generateImagesWithHuggingFace(text, mood) {
  const moodPrompts = {
    '温馨': 'warm cozy family scene, soft lighting, comfortable home atmosphere',
    '怀念': 'nostalgic vintage scene, old memories, sepia tones, retro style',
    '快乐': 'joyful happy scene, bright colors, celebration, smiling people',
    '宁静': 'peaceful calm nature scene, serene landscape, tranquil atmosphere',
    '感动': 'emotional touching moment, heartwarming scene, tender feelings',
    '希望': 'hopeful bright future scene, sunrise, new beginnings, optimistic'
  };
  
  const basePrompt = moodPrompts[mood] || 'beautiful peaceful scene';
  const prompt = `${basePrompt}, high quality, detailed, artistic style`;
  
  try {
    console.log('使用Hugging Face生成图片...');
    
    // 使用Stable Diffusion模型生成图片
    const imagePromises = Array.from({ length: 3 }, async (_, index) => {
      try {
        const response = await hf.textToImage({
          model: 'stabilityai/stable-diffusion-2-1',
          inputs: `${prompt}, variation ${index + 1}`,
          parameters: {
            negative_prompt: 'blurry, low quality, distorted, ugly',
            num_inference_steps: 20,
            guidance_scale: 7.5,
          }
        });
        
        // 将Blob转换为base64
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        
        return {
          url: dataUrl,
          description: `AI生成图片 - ${mood}风格`,
          source: 'Hugging Face AI'
        };
      } catch (error) {
        console.error(`Hugging Face图片生成失败 ${index + 1}:`, error.message);
        // 返回占位图片
        return {
          url: `https://picsum.photos/400/300?random=${Date.now() + index}`,
          description: `${mood}风格图片`,
          source: 'Placeholder'
        };
      }
    });
    
    const images = await Promise.all(imagePromises);
    
    return {
      images: images,
      mood: mood,
      timestamp: new Date().toISOString(),
      source: 'Hugging Face AI'
    };
    
  } catch (error) {
    console.error('Hugging Face API调用失败:', error.message);
    throw error;
  }
}

// 使用Pexels API获取高质量图片
async function generateImagesWithPexels(text, mood) {
  const moodKeywords = {
    '温馨': 'family cozy home warm',
    '怀念': 'vintage nostalgic memories old',
    '快乐': 'happy joy celebration smile',
    '宁静': 'peaceful calm nature serene',
    '感动': 'emotional touching heartwarming',
    '希望': 'hope sunrise light future'
  };
  
  const keywords = moodKeywords[mood] || 'beautiful nature';
  
  try {
    console.log('使用Pexels获取图片...');
    
    const response = await axios.get('https://api.pexels.com/v1/search', {
      headers: {
        'Authorization': process.env.PEXELS_API_KEY
      },
      params: {
        query: keywords,
        per_page: 3,
        orientation: 'landscape'
      }
    });
    
    const images = response.data.photos.map(photo => ({
      url: photo.src.medium,
      description: `${mood}风格 - ${photo.alt || '精美图片'}`,
      source: `Pexels - ${photo.photographer}`
    }));
    
    return {
      images: images,
      mood: mood,
      timestamp: new Date().toISOString(),
      source: 'Pexels API'
    };
    
  } catch (error) {
    console.error('Pexels API调用失败:', error.message);
    throw error;
  }
}

// 使用OpenAI DALL-E生成图片
async function generateImagesWithDALLE(text, mood) {
  try {
    const prompt = `根据以下文本和情感创作一幅温暖美丽的画面：文本："${text}"，情感：${mood}。风格：温暖、治愈、美好的回忆风格`;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    
    const images = response.data.map(img => ({
      url: img.url,
      description: `AI生成图片 - ${mood}风格`,
      source: 'OpenAI DALL-E'
    }));
    
    return {
      images: images,
      mood: mood,
      timestamp: new Date().toISOString(),
      source: 'OpenAI DALL-E'
    };
    
  } catch (error) {
    console.error('DALL-E API调用失败:', error.message);
    throw error;
  }
}

// 模拟图片生成功能（备用方案）
function generateImagesMock(text, mood) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 根据心情生成不同风格的图片
      const imageStyles = {
        '温馨': [
          'https://picsum.photos/400/300?random=1&blur=1',
          'https://picsum.photos/400/300?random=2',
          'https://picsum.photos/400/300?random=3'
        ],
        '怀念': [
          'https://picsum.photos/400/300?random=4&grayscale',
          'https://picsum.photos/400/300?random=5&blur=1',
          'https://picsum.photos/400/300?random=6'
        ],
        '快乐': [
          'https://picsum.photos/400/300?random=7',
          'https://picsum.photos/400/300?random=8',
          'https://picsum.photos/400/300?random=9'
        ],
        '宁静': [
          'https://picsum.photos/400/300?random=10',
          'https://picsum.photos/400/300?random=11',
          'https://picsum.photos/400/300?random=12'
        ],
        '感动': [
          'https://picsum.photos/400/300?random=13&grayscale',
          'https://picsum.photos/400/300?random=14',
          'https://picsum.photos/400/300?random=15'
        ],
        '希望': [
          'https://picsum.photos/400/300?random=16',
          'https://picsum.photos/400/300?random=17',
          'https://picsum.photos/400/300?random=18'
        ]
      };
      
      // 默认图片
      const defaultImages = [
        'https://picsum.photos/400/300?random=19',
        'https://picsum.photos/400/300?random=20',
        'https://picsum.photos/400/300?random=21'
      ];
      
      resolve(imageStyles[mood] || defaultImages);
    }, 2000);
  });
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
    console.log(`   - 文本润色处理`);
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