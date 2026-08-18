const messageUser = getCurrentUser();
if (!messageUser) location.href = "login.html?next=messages.html";
const mobileMessenger = matchMedia("(max-width: 760px)");
document.querySelector('meta[name="viewport"]')?.setAttribute("content", "width=device-width,initial-scale=1,viewport-fit=cover");
const mobileStyles = document.createElement("link");mobileStyles.rel = "stylesheet";mobileStyles.href = "messages-mobile.css?v=1.0.3";document.head.appendChild(mobileStyles);
function syncMessengerHeight(){document.documentElement.style.setProperty("--messenger-height",`${window.visualViewport?.height||window.innerHeight}px`);}
syncMessengerHeight();window.visualViewport?.addEventListener("resize",()=>{syncMessengerHeight();requestAnimationFrame(()=>{$("#chatMessages")?.scrollTo(0,$("#chatMessages").scrollHeight);});});window.addEventListener("orientationchange",()=>setTimeout(syncMessengerHeight,150));

const params = new URLSearchParams(location.search);
const requestedUserId = Number(params.get("to")) || null;
const requestedUserName = params.get("name") || "站内用户";
const state = {
  notices: [],
  directs: [],
  follows: { following: [], mutual: [] },
  conversations: [],
  activeId: requestedUserId,
  activeName: requestedUserName,
  view: requestedUserId ? "chat" : "notifications"
};

const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[character]));
const initial = name => Array.from(String(name || "U").trim())[0]?.toUpperCase() || "U";
const displayTime = value => new Date(value).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
const displayDate = value => new Date(value).toLocaleDateString("zh-CN", { month: "long", day: "numeric" });

async function apiMessages(path, options = {}) {
  const response = await fetch(wikiApiUrl(path), { headers: apiHeaders(), ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "请求失败");
  return data;
}

function buildConversations() {
  const groups = new Map();
  for (const item of state.directs) {
    const incoming = Number(item.recipientId) === Number(messageUser.id);
    const otherId = Number(incoming ? item.senderId : item.recipientId);
    const otherName = incoming ? item.senderName : item.recipientName;
    const otherAvatar = incoming ? item.senderAvatar : item.recipientAvatar;
    if (!groups.has(otherId)) groups.set(otherId, { id: otherId, name: otherName || "站内用户", avatar:otherAvatar||"", items: [] });
    groups.get(otherId).items.push(item);
  }
  if (requestedUserId && !groups.has(requestedUserId)) {
    groups.set(requestedUserId, { id: requestedUserId, name: requestedUserName, items: [] });
  }
  state.conversations = [...groups.values()].map(group => {
    group.items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    group.latest = group.items[group.items.length - 1] || null;
    return group;
  }).sort((a, b) => new Date(b.latest?.createdAt || 0) - new Date(a.latest?.createdAt || 0));
}

function renderConversationList(filter = "") {
  const query = filter.trim().toLowerCase();
  const conversations = state.conversations.filter(item => item.name.toLowerCase().includes(query));
  $("#conversationList").innerHTML = conversations.length ? conversations.map(item => {
    const latest = item.latest;
    const preview = latest ? latest.content : "开始一段新对话";
    const unread = state.notices.filter(notice => !notice.read && notice.type === "direct_message" && Number(notice.actorUserId) === item.id).length;
    return `<button class="conversation-item ${item.id === state.activeId && state.view === "chat" ? "active" : ""}" type="button" data-conversation="${item.id}" data-name="${escapeHtml(item.name)}">
      <span class="conversation-avatar">${item.avatar?`<img src="${item.avatar}" alt="">`:escapeHtml(initial(item.name))}</span>
      <span class="conversation-copy"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(preview)}</span></span>
      <span class="conversation-meta"><time>${latest ? displayTime(latest.createdAt) : ""}</time>${unread ? `<b>${unread > 99 ? "99+" : unread}</b>` : ""}</span>
    </button>`;
  }).join("") : `<div class="messenger-empty">${query ? "没有找到联系人" : "还没有私信，从评论区点击用户头像即可开始聊天。"}</div>`;
}

function renderChat() {
  const conversation = state.conversations.find(item => item.id === state.activeId) || {
    id: state.activeId, name: state.activeName || "站内用户", items: []
  };
  state.activeName = conversation.name;
  $("#chatName").textContent = conversation.name;
  $("#chatAvatar").innerHTML = conversation.avatar ? `<img src="${conversation.avatar}" alt="">` : escapeHtml(initial(conversation.name));
  const following = state.follows.following.includes(conversation.id), mutual = state.follows.mutual.includes(conversation.id);
  $("#chatStatus").textContent = mutual ? "互相关注 · 可以自由聊天" : "站内用户 · 未互关最多发送两条";
  $("#chatFollowButton").textContent = mutual ? "已互关 · 取消关注" : following ? "取消关注" : "关注";
  $("#chatFollowButton").classList.toggle("following", following);
  let lastDate = "";
  $("#chatMessages").innerHTML = conversation.items.length ? conversation.items.map(item => {
    const date = displayDate(item.createdAt);
    const separator = date !== lastDate ? `<div class="chat-day">${date}</div>` : "";
    lastDate = date;
    const outgoing = Number(item.senderId) === Number(messageUser.id);
    return `${separator}<article class="message-bubble ${outgoing ? "outgoing" : "incoming"}"><p>${escapeHtml(item.content)}</p><time>${displayTime(item.createdAt)}${outgoing ? " ✓" : ""}</time></article>`;
  }).join("") : `<div class="messenger-empty">你们还没有聊过，发一句问候吧。</div>`;
  requestAnimationFrame(() => { $("#chatMessages").scrollTop = $("#chatMessages").scrollHeight; });
}

function renderNotifications() {
  const notices = state.notices.filter(item => item.type !== "direct_message");
  $("#notificationList").innerHTML = notices.length ? notices.map(item => {
    const articleLink = item.type === "comment_reply" ? `article.html?id=${item.articleId}#comments` : "#";
    const follow = item.type === "follow" && item.actorUserId ? `<button type="button" data-follow-back="${item.actorUserId}">${state.follows.following.includes(item.actorUserId) ? (state.follows.mutual.includes(item.actorUserId) ? "已互关" : "已关注") : "回关"}</button>` : "";
    const canMessageActor = item.actorUserId && ["follow", "comment_reply"].includes(item.type);
    const chat = canMessageActor ? `<button type="button" data-chat-user="${item.actorUserId}" data-chat-name="${escapeHtml(item.actorName || "站内用户")}">私信</button>` : "";
    return `<article class="notification-card ${item.read ? "" : "unread"}"><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.content)}</p><small>${new Date(item.createdAt).toLocaleString("zh-CN")}</small></div><div class="notification-actions">${articleLink !== "#" ? `<a href="${articleLink}">查看</a>` : ""}${follow}${chat}</div></article>`;
  }).join("") : '<div class="messenger-empty">暂无系统通知</div>';
}

function showView(view) {
  state.view = view;
  $("#chatPlaceholder").hidden = view !== "empty";
  $("#chatView").hidden = view !== "chat";
  $("#notificationView").hidden = view !== "notifications";
  if (view !== "empty") $("#messengerShell").classList.add("chat-open");
  $("#showNotifications").classList.toggle("active", view === "notifications");
  renderConversationList($("#conversationSearch").value);
  if (view === "chat") renderChat();
  if (view === "notifications") renderNotifications();
}

function messageToast(text, type = "error") {
  document.querySelector(".message-toast")?.remove();
  document.body.insertAdjacentHTML("beforeend", `<div class="message-toast ${type}">${escapeHtml(text)}</div>`);
  setTimeout(() => document.querySelector(".message-toast")?.remove(), 3200);
}

function updateUnreadSummary() {
  const systemUnread = state.notices.filter(item => !item.read && item.type !== "direct_message").length;
  const directUnread = state.notices.filter(item => !item.read && item.type === "direct_message").length;
  $("#messageSummary").textContent = `${state.conversations.length} 个会话 · ${systemUnread + directUnread} 条未读`;
  $("#notificationBadge").hidden = systemUnread === 0;
  $("#notificationBadge").textContent = systemUnread > 99 ? "99+" : systemUnread;
  document.querySelector(".message-fab")?.remove();
  document.querySelector(".unread-popup")?.remove();
}

async function markNotificationsRead(ids) {
  const unreadIds = new Set(ids.map(Number));
  if (!unreadIds.size) return;
  state.notices.forEach(item => { if (unreadIds.has(Number(item.id))) item.read = true; });
  updateUnreadSummary();
  renderConversationList($("#conversationSearch").value);
  renderNotifications();
  try { await apiMessages("/api/notifications/read", { method: "PUT", body: JSON.stringify({ ids: [...unreadIds] }) }); }
  catch (error) { messageToast("已读状态保存失败，服务器恢复后会重新同步"); await loadMessenger({ quiet: true }); }
}

function markSystemNotificationsRead() {
  return markNotificationsRead(state.notices.filter(item => !item.read && item.type !== "direct_message").map(item => item.id));
}

function markConversationRead(userId) {
  return markNotificationsRead(state.notices.filter(item => !item.read && item.type === "direct_message" && Number(item.actorUserId) === Number(userId)).map(item => item.id));
}

function selectConversation(id, name) {
  state.activeId = Number(id);
  state.activeName = name || "站内用户";
  if (!state.conversations.some(item => item.id === state.activeId)) {
    state.conversations.unshift({ id: state.activeId, name: state.activeName, items: [], latest: null });
  }
  const nextUrl=`messages.html?to=${state.activeId}&name=${encodeURIComponent(state.activeName)}`;
  if(mobileMessenger.matches)history.pushState({messengerPanel:true},"",nextUrl);else history.replaceState(null,"",nextUrl);
  showView("chat");
  markConversationRead(state.activeId);
  if(!mobileMessenger.matches)$("#chatInput").focus();
}

async function loadMessenger({ quiet = false } = {}) {
  try {
    const [noticeData, directData, followData] = await Promise.all([
      apiMessages("/api/notifications"), apiMessages("/api/direct-messages"), apiMessages("/api/follows")
    ]);
    state.notices = noticeData.items || [];
    state.directs = directData.items || [];
    state.follows = followData;
    buildConversations();
    updateUnreadSummary();
    renderConversationList($("#conversationSearch").value);
    if (state.view === "chat" && state.activeId) renderChat();
    if (state.view === "notifications") { showView("notifications"); await markSystemNotificationsRead(); }
    if (requestedUserId && state.view === "empty") selectConversation(requestedUserId, requestedUserName);
  } catch (error) {
    if (!quiet) $("#conversationList").innerHTML = `<div class="messenger-empty">${escapeHtml(error.message)}</div>`;
  }
}

async function clearMessageGroup(path, message) {
  if (!confirm(message)) return;
  try { await apiMessages(path, { method: "DELETE" }); await loadMessenger(); }
  catch (error) { messageToast(error.message); }
}

$("#conversationList").addEventListener("click", event => {
  const item = event.target.closest("[data-conversation]");
  if (item) selectConversation(item.dataset.conversation, item.dataset.name);
});
$("#conversationSearch").addEventListener("input", event => renderConversationList(event.target.value));
$("#showNotifications").addEventListener("click", async () => { showView("notifications"); await markSystemNotificationsRead(); });
function closeMobilePanel(){if(mobileMessenger.matches&&history.state?.messengerPanel)history.back();else{$("#messengerShell").classList.remove("chat-open");showView("empty");}}
$("#chatBack").addEventListener("click",closeMobilePanel);
$("#notificationBack").addEventListener("click",closeMobilePanel);
window.addEventListener("popstate",()=>{if(mobileMessenger.matches){$("#messengerShell").classList.remove("chat-open");showView("empty");}});

$("#chatCompose").addEventListener("submit", async event => {
  event.preventDefault();
  const input = $("#chatInput"), content = input.value.trim();
  if (!content || !state.activeId) return;
  const button = event.currentTarget.querySelector("button");
  button.disabled = true;
  try {
    await apiMessages("/api/direct-messages", { method: "POST", body: JSON.stringify({ recipientId: state.activeId, content }) });
    input.value = "";
    input.style.height = "auto";
    await loadMessenger({ quiet: true });
  } catch (error) { messageToast(error.message); }
  finally { button.disabled = false; if(!mobileMessenger.matches)input.focus(); }
});
$("#chatInput").addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); $("#chatCompose").requestSubmit(); }
});
$("#chatInput").addEventListener("input", event => {
  event.target.style.height = "auto";
  event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
});
$("#chatFollowButton").addEventListener("click", async () => {
  if (!state.activeId) return;
  const wasFollowing = state.follows.following.includes(state.activeId);
  if (wasFollowing && !confirm(`确定取消关注“${state.activeName}”吗？`)) return;
  try { await apiMessages(`/api/follows/${state.activeId}`, { method: "POST", body: "{}" }); await loadMessenger({ quiet: true }); messageToast(wasFollowing ? "已取消关注" : "关注成功", "success"); }
  catch (error) { messageToast(error.message); }
});

$("#notificationList").addEventListener("click", async event => {
  const chat = event.target.closest("[data-chat-user]");
  if (chat) { selectConversation(chat.dataset.chatUser, chat.dataset.chatName); return; }
  const follow = event.target.closest("[data-follow-back]");
  if (!follow) return;
  try { await apiMessages(`/api/follows/${follow.dataset.followBack}`, { method: "POST", body: "{}" }); await loadMessenger(); }
  catch (error) { messageToast(error.message); }
});
$("#readAllMessages").addEventListener("click", async () => { await apiMessages("/api/notifications/read", { method: "PUT", body: "{}" }); await loadMessenger(); });
$("#clearReadMessages").addEventListener("click", () => clearMessageGroup("/api/notifications?scope=read", "确定清除所有已读通知吗？"));
$("#clearSystemMessages").addEventListener("click", () => clearMessageGroup("/api/notifications?scope=system", "确定清除全部系统通知吗？私信不会被删除。"));
$("#clearDirectMessages").addEventListener("click", () => clearMessageGroup("/api/direct-messages", "确定清除你的全部私信记录吗？对方的记录不受影响。"));

loadMessenger();
setInterval(() => loadMessenger({ quiet: true }), 12000);
