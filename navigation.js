/**
 * Xist2024 导航页专属脚本
 * 版本: v1.1
 * 功能:
 * 1. 动态时钟与网站运行时间
 * 2. 弹窗式搜索引擎
 * 3. 一键复制联系方式
 * 4. 可复用的顶部通知框 (Toast)
 */

// --- 新增：v1.1 时钟与运行时间逻辑 ---

// 设置与主页完全一致的网站建立精确时间
const websiteStartTime = new Date(2025, 6, 9, 1, 22, 0); // 月份6代表7月

function updateNavClockAndUptime() {
    const now = new Date();
    
    // 更新时间
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeEl = document.getElementById('nav-current-time');
    if (timeEl) timeEl.textContent = `${hours}:${minutes}:${seconds}`;

    // 更新日期
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const dateEl = document.getElementById('nav-current-date');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('zh-CN', options);

    // 更新网站运行时间
    const diff = now.getTime() - websiteStartTime.getTime();
    const uptimeEl = document.getElementById('nav-uptime');
    if (uptimeEl) {
        if (diff < 0) {
            uptimeEl.textContent = "网站尚未开始运行...";
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const years = Math.floor(totalSeconds / (365.25 * 24 * 60 * 60));
        const days = Math.floor((totalSeconds % (365.25 * 24 * 60 * 60)) / (24 * 60 * 60));
        const hoursUptime = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutesUptime = Math.floor((totalSeconds % (60 * 60)) / 60);
        const secondsUptime = totalSeconds % 60;

        let uptimeString = '';
        if (years > 0) uptimeString += `${years} 年 `;
        uptimeString += `${days} 天 ${hoursUptime} 小时 ${minutesUptime} 分 ${secondsUptime} 秒`;
        uptimeEl.textContent = uptimeString;
    }
}

// --- 通用工具函数 (Toast, 复制) ---

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
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(content);
            showToast(`${itemType} 已成功复制！`);
        } catch (err) {
            console.error('复制失败: ', err);
            showToast(`复制失败，浏览器可能不支持。`, 3000);
        }
    } else {
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

// --- 弹窗小工具框架 ---

const popupContainer = document.getElementById('popup-container');
let currentKeyListener = null;

function createPopup(title, contentHtml, specificClass = '') {
    if (currentKeyListener) {
        document.removeEventListener('keydown', currentKeyListener);
        currentKeyListener = null;
    }
    popupContainer.innerHTML = '';
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
    setTimeout(() => { popupContainer.innerHTML = ''; }, 300);
}

// --- 必应搜索弹窗逻辑 ---

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
    
    currentKeyListener = (e) => {
        if (e.key === 'Enter') performSearch();
        if (e.key === 'Escape') closePopup();
    };
    document.addEventListener('keydown', currentKeyListener);
    
    searchInput.focus();
}

// --- 新增：v1.1 页面全局心跳 ---

// 每1秒更新一次时钟和运行时间
setInterval(updateNavClockAndUptime, 1000);

// 页面加载时立即更新一次，避免初始空白
document.addEventListener('DOMContentLoaded', () => {
    updateNavClockAndUptime();
});
