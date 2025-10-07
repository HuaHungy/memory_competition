// DOM 元素获取
const memoryInput = document.getElementById('memory-input');
const polishBtn = document.getElementById('polish-btn');
const generateImageBtn = document.getElementById('generate-image-btn');
const polishedContainer = document.getElementById('polished-container');
const polishedText = document.getElementById('polished-text');
const moodAnalysis = document.getElementById('mood-analysis');
const imageContainer = document.getElementById('image-container');
const imageGallery = document.getElementById('image-gallery');
const loadingOverlay = document.getElementById('loading-overlay');

// 全局变量
let currentPolishedText = '';
let currentMood = '';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 监听输入变化
    memoryInput.addEventListener('input', function() {
        const hasText = this.value.trim().length > 0;
        polishBtn.disabled = !hasText;
        
        if (!hasText) {
            generateImageBtn.disabled = true;
            hideResults();
        }
    });

    // 润色按钮点击事件
    polishBtn.addEventListener('click', handlePolishText);
    
    // 生成图片按钮点击事件
    generateImageBtn.addEventListener('click', handleGenerateImage);
    
    // 初始状态
    polishBtn.disabled = true;
    generateImageBtn.disabled = true;
});

// 处理文本润色
async function handlePolishText() {
    const inputText = memoryInput.value.trim();
    if (!inputText) {
        showNotification('请输入一些文字', 'warning');
        return;
    }

    showLoading('正在润色您的回忆...');
    
    try {
        const response = await fetch('/api/polish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: inputText })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            currentPolishedText = data.polishedText;
            currentMood = data.mood;
            
            displayPolishedResult(data.polishedText, data.mood, data.moodDescription);
            generateImageBtn.disabled = false;
            showNotification('回忆润色完成！', 'success');
        } else {
            throw new Error(data.error || '润色失败');
        }
    } catch (error) {
        console.error('润色错误:', error);
        showNotification('润色失败，请稍后重试', 'error');
        
        // 显示模拟结果（用于演示）
        showDemoPolishResult(inputText);
    } finally {
        hideLoading();
    }
}

// 处理图片生成
async function handleGenerateImage() {
    if (!currentPolishedText) {
        showNotification('请先润色文本', 'warning');
        return;
    }

    showLoading('正在生成记忆画面...');
    
    try {
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                text: currentPolishedText,
                mood: currentMood 
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            displayImageResult(data.images);
            showNotification('记忆画面生成完成！', 'success');
        } else {
            throw new Error(data.error || '图片生成失败');
        }
    } catch (error) {
        console.error('图片生成错误:', error);
        showNotification('图片生成失败，请稍后重试', 'error');
        
        // 显示模拟结果（用于演示）
        showDemoImageResult();
    } finally {
        hideLoading();
    }
}

// 显示润色结果
function displayPolishedResult(polished, mood, moodDesc) {
    polishedText.innerHTML = polished;
    moodAnalysis.innerHTML = `
        <strong>情感分析：</strong>${mood}<br>
        <strong>心情描述：</strong>${moodDesc}
    `;
    
    polishedContainer.style.display = 'block';
    polishedContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 显示图片结果
function displayImageResult(images) {
    imageGallery.innerHTML = '';
    
    images.forEach((imageUrl, index) => {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `记忆画面 ${index + 1}`;
        img.className = 'memory-image';
        img.loading = 'lazy';
        
        // 添加点击放大功能
        img.addEventListener('click', () => openImageModal(imageUrl));
        
        imageGallery.appendChild(img);
    });
    
    imageContainer.style.display = 'block';
    imageContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 显示演示润色结果
function showDemoPolishResult(originalText) {
    const demoPolished = enhanceTextDemo(originalText);
    const demoMood = analyzeMoodDemo(originalText);
    
    currentPolishedText = demoPolished;
    currentMood = demoMood.mood;
    
    displayPolishedResult(demoPolished, demoMood.mood, demoMood.description);
    generateImageBtn.disabled = false;
}

// 显示演示图片结果
function showDemoImageResult() {
    // 使用占位图片服务生成示例图片
    const demoImages = [
        'https://picsum.photos/400/300?random=1',
        'https://picsum.photos/400/300?random=2',
        'https://picsum.photos/400/300?random=3'
    ];
    
    displayImageResult(demoImages);
}

// 文本增强演示函数
function enhanceTextDemo(text) {
    // 简单的文本增强逻辑
    const enhancements = [
        '那是一个温暖的午后，',
        '微风轻抚过脸颊，',
        '阳光透过窗棂洒在桌案上，',
        '时光仿佛在那一刻静止，',
        '心中涌起一阵暖流，'
    ];
    
    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    return randomEnhancement + text + '。这份美好的回忆，如珍珠般闪闪发光，永远珍藏在心底最柔软的角落。';
}

// 情感分析演示函数
function analyzeMoodDemo(text) {
    const moods = [
        { mood: '温暖怀念', description: '文字中透露出对美好时光的深深眷恋，带着温暖的回忆色彩' },
        { mood: '宁静安详', description: '字里行间流淌着内心的平静与安宁，如湖水般清澈' },
        { mood: '甜蜜幸福', description: '回忆中充满了甜蜜的幸福感，让人不禁嘴角上扬' },
        { mood: '感动深情', description: '深深的情感在文字中流淌，触动心灵最柔软的地方' }
    ];
    
    return moods[Math.floor(Math.random() * moods.length)];
}

// 显示加载状态
function showLoading(message = '正在处理...') {
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = message;
    }
    loadingOverlay.style.display = 'flex';
}

// 隐藏加载状态
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// 隐藏结果区域
function hideResults() {
    polishedContainer.style.display = 'none';
    imageContainer.style.display = 'none';
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 关闭按钮事件
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // 自动关闭
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

// 获取通知颜色
function getNotificationColor(type) {
    const colors = {
        success: 'linear-gradient(135deg, #4CAF50, #45a049)',
        error: 'linear-gradient(135deg, #f44336, #da190b)',
        warning: 'linear-gradient(135deg, #ff9800, #f57c00)',
        info: 'linear-gradient(135deg, #2196F3, #0b7dda)'
    };
    return colors[type] || colors.info;
}

// 图片模态框
function openImageModal(imageUrl) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-backdrop">
            <div class="modal-content">
                <img src="${imageUrl}" alt="记忆画面" class="modal-image">
                <button class="modal-close">&times;</button>
            </div>
        </div>
    `;
    
    // 添加样式
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1002;
        animation: fadeIn 0.3s ease;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        position: relative;
        max-width: 90%;
        max-height: 90%;
    `;
    
    const modalImage = modal.querySelector('.modal-image');
    modalImage.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 10px;
    `;
    
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.style.cssText = `
        position: absolute;
        top: -10px;
        right: -10px;
        background: white;
        border: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // 添加到页面
    document.body.appendChild(modal);
    
    // 关闭事件
    const closeModal = () => modal.remove();
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.className === 'modal-backdrop') {
            closeModal();
        }
    });
    
    // ESC键关闭
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(style);