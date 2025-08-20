/**
 * Xist2024 导航页专属脚本
 * 功能:
 * 1. 弹窗式搜索引擎
 * 2. 一键复制联系方式
 * 3. 可复用的顶部通知框 (Toast)
 *
 * 此脚本中的函数均提取自您的主页脚本 (script.js)
 * 以确保逻辑和体验完全一致。
 */

// --- 通用工具函数 (从 script.js 提取) ---

let toastTimeout;
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast-notification');
    if (!toast) {
        console.error("错误：HTML中缺少 id='toast-notification' 的元素！");
        return;
    }
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.remove('show');
    setTimeout(() => { toast.classList.add('show'); }, 10);
    toastTimeout = setTimeout(() => { toast.classList.remove('show'); }, duration);
}

async function copyToClipboard(content, itemType) {
    // 优先使用安全、现代的剪贴板API
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(content);
            showToast(`${itemType} 已成功复制！`);
        } catch (err) {
            console.error('复制失败: ', err);
            showToast(`复制失败，浏览器可能不支持。`, 3000);
        }
    } else {
        // 如果不支持，则使用传统的备用方法
        const textArea = document.createElement("textarea");
        textArea.value = content;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast(`${itemType} 已成功复制！`);
        } catch (err)
        {
            console.error('备用复制方法失败: ', err);
            showToast(`复制失败，请尝试手动复制。`, 3000);
        }
        document.body.removeChild(textArea);
    }
}

// --- 弹窗小工具框架 (从 script.js 提取) ---

const popupContainer = document.getElementById('popup-container');
let currentKeyListener = null;

function createPopup(title, contentHtml, specificClass = '') {
    if (currentKeyListener) {
        document.removeEventListener('keydown', currentKeyListener);
        currentKeyListener = null;
    }
    popupContainer.innerHTML = ''; // 清空之前的弹窗
    const popupCard = document.createElement('div');
    popupCard.className = 'popup-card ' + specificClass;
    popupCard.innerHTML = `
        <button class="close-button" onclick="closePopup()"></button>
        <h2>${title}</h2>
        <div>${contentHtml}</div>
    `;
    popupContainer.appendChild(popupCard);
    popupContainer.classList.add('show');
}

function closePopup() {
    popupContainer.classList.remove('show');
    if (currentKeyListener) {
        document.removeEventListener('keydown', currentKeyListener);
        currentKeyListener = null;
    }
    // 等待动画结束后再清空内容
    setTimeout(() => { popupContainer.innerHTML = ''; }, 300);
}

// --- 必应搜索弹窗逻辑 (从 script.js 提取) ---

function setupSearchEngine() {
    const searchHtml = `
        <div class="search-popup-content">
            <input type="text" id="search-input" placeholder="输入搜索内容..." autofocus>
            <button id="search-button">搜索</button>
        </div>
    `;
    createPopup('必应搜索', searchHtml);
    
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            window.open(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, '_blank');
            closePopup();
        }
    };
    
    searchButton.addEventListener('click', performSearch);
    
    // 支持回车搜索和ESC关闭
    currentKeyListener = (e) => {
        if (e.key === 'Enter') performSearch();
        if (e.key === 'Escape') closePopup();
    };
    document.addEventListener('keydown', currentKeyListener);
    
    // 自动聚焦到输入框
    searchInput.focus();
}```

