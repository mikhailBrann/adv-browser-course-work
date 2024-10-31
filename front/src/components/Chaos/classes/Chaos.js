import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';

import Widget from "./Widget";
import Request from "./Request";
import Validate from "./Validate";

import authForm from "../template/authForm.html";
import registerForm from "../template/RegisterForm.html";
import authTemplate from "../template/authTemplate.html";
import chatTemplate from "../template/chatTemplate.html";
import sendMessageForm from "../template/sendMessageForm.html";

export default class Chaos {
    constructor(parentNode) {
        this.parentNode = parentNode ?? document.body;
        this.request = new Request();
        this.formsWidget = null;
        this.errMessIdTimeoutId = null;
        this.scrollChatToTop = false;

        this.initChat();
    }

    initChat() {
        if(localStorage.getItem('isAuthenticated') === 'true') {
            this._initChatForm();
        } else {
            this._initAuthForm();
        }
    }

    chaosTabChecker(event) {
        const currentElem = event.currentTarget;
        const currentValue = currentElem.dataset.tab;
        const parent = currentElem.closest('.chaos-forms');
        const tabs = parent.querySelectorAll('[data-tab]');
        const forms = parent.querySelectorAll('[data-form]');

        if(currentElem.classList.contains('active')) {
            return;
        }

        tabs.forEach(tab => tab.classList.remove('active'));
        forms.forEach(form => form.classList.remove('active'));

        currentElem.classList.add('active');
        parent.querySelector(`[data-form="${currentValue}"]`).classList.add('active');
    }

    sendFile(event, url) {
        event.preventDefault();
        const file = event.currentTarget.files && event.currentTarget.files[0];

        if(!file) {
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: reader.result
            };

            const request = this.request.send(JSON.stringify(fileData), 'POST', url);

            request.then(response => response.json()).then(responseData => {
                if(responseData.status === 'success') {
                    window.location.reload();
                }
    
                if(responseData.status === 'error') {
                    this._initFormMess(form, responseData.message);
                }
            });
        }
    }

    sendAuthForms(event, url) {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = {};
        const formFields = form.querySelectorAll('input, select, textarea');

        formFields.forEach((field) => {
            formData[field.name] = field.value;
        });

        const request = this.request.send(JSON.stringify(formData), 'POST', url);

        request.then(response => response.json()).then(responseData => {
            if(responseData.status === 'success') {
                const { data } = responseData;
                
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('id', data.id);
                localStorage.setItem('login', data.login);
                this.hideAuthForms();
            }

            if(responseData.status === 'error') {
                this._initFormMess(form, responseData.message);
            }
        });
    }

    sendRegisterForms(event, url) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = {};
        const formFields = form.querySelectorAll('input, select, textarea');

        formFields.forEach((field) => {
            formData[field.name] = field.value;
        });

        const request = this.request.send(JSON.stringify(formData), 'POST', url);

        request.then(response => response.json()).then(responseData => {
            if(responseData.status === 'success') {
                const submitBtn = form.querySelector('[type="submit"]');
                const chaosTabParent = form.closest('.chaos-forms').querySelector('.chaos-forms__tab[data-tab="auth"]');

                this._initFormMess(form, responseData.message);
                submitBtn.disabled = true;

                setTimeout(() => {
                    chaosTabParent.click();
                    submitBtn.disabled = false;
                }, 3000);
            }

            if(responseData.status === 'error') {
                this._initFormMess(form, responseData.message);
            }
        });
    }

    hideAuthForms() {
        if(this.formsWidget?.element) {
            this._removeElement(this.formsWidget.element);
            this.formsWidget = null;
            this._initChatForm();
        }
    }

    async downloadFileByLink(element) {
        if(!element.hasAttribute('data-url')) {
            return;
        }

        const fileUrl = element.dataset.url;

        element.classList.add('loading');
        fetch(fileUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileUrl.split('/').pop();
                link.click();
                window.URL.revokeObjectURL(url);
                element.classList.remove('loading');
        });
    }

    replaceCodeBlocks(text) {
        // Регулярное выражение для поиска блоков кода
        const codeBlockRegex = /```([\s\S]*?)```/g;
        
        // Заменяем каждый найденный блок
        return text.replace(codeBlockRegex, (match, code) => {
            const highlightedCode = Prism.highlight(
                code.trim(),
                Prism.languages.javascript,
                'javascript'
            );
            
            return `<pre><code class="language-javascript">${highlightedCode}</code></pre>`;
        });
    }

    _renderList(data) {
        const chat = this.chatWidget;
        const messagesList = chat.element.querySelector('.message-list');

        messagesList.addEventListener("click", (event) => {
            const targetElem = event.target;

            if(targetElem.hasAttribute('data-event-type') && targetElem.dataset.eventType === 'downloadFile') {
                this.downloadFileByLink(targetElem);
            }
        });

        if(data.length === 0) {
            return;
        }

        data.forEach(item => {
            let template = '';
            const formattedDate = new Date(item.created)
                .toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
                .replace(',', '');

            switch (item.type) {
                case 'text':
                    const processedText = this.replaceCodeBlocks(item.value);
                    template = processedText;
                    break;
                case 'link':
                    template = `<a href="${item.value}" target="_blank">${item.value}</a>`;
                case 'image':
                    template = `<a href="${this.request.backendUrl}/${item.value}" target="_blank">
                        <img src="${this.request.backendUrl}/${item.value}" alt="${item.name}">
                    </a>`;
                    break;
                case 'video':
                    template = `<video controls>
                            <source src="${this.request.backendUrl}/${item.value}">
                        </video>
                        <div class="message-item__download">
                            <button class="message-item__download-btn" data-url="${this.request.backendUrl}/${item.value}" data-event-type="downloadFile">Скачать</button>
                        </div>`;
                    break;
                case 'audio':
                    template = `<audio controls>
                            <source src="${this.request.backendUrl}/${item.value}">
                        </audio>
                        <div class="message-item__download">
                            <button class="message-item__download-btn" data-url="${this.request.backendUrl}/${item.value}" data-event-type="downloadFile">Скачать</button>
                        </div>`;
                    break;
                default:
                    break;
            }

            const itemTemplate = `<li class="message-item" data-message-type="${item.type}">
                <span class="message-item__content">${template}</span>
                <span class="message-item__data">${formattedDate}</span>
            </li>`;

            chat.addElement(itemTemplate, '.message-list', "afterbegin");
        });

        if(!this.scrollChatToTop) {
            this._listRemoteToTop();
            this.scrollChatToTop = true;
        }
    }

    _listRemoteToTop() {
        const chatContainer = this.chatWidget.element.querySelector('.message-list');
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    _getList(urlParams=false) {
        const userId = localStorage.getItem('id');
        let url = '/message?method=getList';

        if(!userId) {
            return;
        }

        url += `&userId=${userId}`;

        if(urlParams) {
            for(const param in urlParams) {
                url += `&${param}=${urlParams[param]}`;
            }
        }

        const request = this.request.send(false, 'GET', url);

        request.then(response => response.json()).then(responseData => {
            if(responseData.status === 'success' && responseData.data.length > 0) {
                this._renderList(responseData.data);
            }
        });
    }

    _scrollChat(event) {
        const chatContainer = event.currentTarget;
        
        if (chatContainer.scrollTop !== 0) {
            return;
        }

        const messageCount = chatContainer.querySelectorAll('.message-item');

        localStorage.setItem('viewMessCount', messageCount.length);
        this._getList({limit: 10, offset:  messageCount.length, renderQuantity: messageCount.length});
    }

    _initChatForm() {
        const chatTempl = chatTemplate.replaceAll('{{class}}', 'chaos');
        const chatWidget = new Widget("chaos__chat-wrapp", chatTempl, "div");
        const sendMessageTemplate = sendMessageForm.replaceAll('{{class}}', 'send-message-form');

        this.chatWidget = chatWidget;
        this.parentNode.insertAdjacentElement('afterbegin', chatWidget.element);
        this.chatWidget.addElement(sendMessageTemplate, '.chat__sendform-wrapper');
        this.chatWidget.addElement('<ul class="message-list"></ul>', '.chaos__list');
        this.chatWidget.addElement("<button class='btn_logout' data-event='user-logout'>Выйти</button>");

        //addEventListener
        const userId = localStorage.getItem('id');
        const chatFormElem = this.chatWidget.element.querySelector('.chat__sendform-wrapper form');
        const chatListElem = this.chatWidget.element.querySelector('.message-list');
        const formFileField = chatFormElem.querySelector('[data-event="added-file"]');
        const chatMonitor = this.chatWidget.element.querySelector('.chaos__chat.chat');
        const logoutBtn = this.chatWidget.element.querySelector('.btn_logout');

        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.clear();
            window.location.reload();
        });
        chatFormElem.querySelector('textarea[data-event="added-message"]').addEventListener('keydown', this._sendMessage.bind(this));
        formFileField.addEventListener('change', (event) => this.sendFile(event, `/message?method=addedFile&userId=${userId}`));
        chatFormElem.querySelector('.added-file__btn').addEventListener('click', (event) =>  {
            event.preventDefault();
            formFileField.click();
        });
        chatListElem.addEventListener('scroll', this._scrollChat.bind(this));
        //событие при перетаскивании файла
        chatMonitor.addEventListener('dragover', async (event) => {
            event.preventDefault();
            event.currentTarget.classList.add('dragover');
        });
        chatMonitor.addEventListener('drop', (event) => {
            event.preventDefault();
            event.currentTarget.classList.remove('dragover');
    
            const files = event.dataTransfer.files;

            if (files.length === 0) {
                return;
            }

             // После загрузки передаем в input
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(files[0]);
            formFileField.files = dataTransfer.files;

            // Вызываем change событие
            const eventChange = new Event('change');
            formFileField.dispatchEvent(eventChange);
        });


        if(localStorage.getItem('viewMessCount')) {
            this._getList({limit: localStorage.getItem('viewMessCount')});
        } else {
            this._getList();
        }
    }

    _sendMessage(event) {
        const userId = localStorage.getItem('id');
        const form = event.currentTarget.closest('form');

        if(!userId) {
            return;
        }

        if(event.key == 'Enter' && !event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();

            if(event.target.value.trim() == '') {
                return;
            }

            const mess = event.target.value.trim();
            const isLink = Validate.isLink(mess);
            const formData = {
                message: mess,
                userId
            };

            if(isLink) {
                formData.type = 'link';
            }

            const request = this.request.send(JSON.stringify(formData), 'POST', `/message?method=addedMessage&userId=${userId}`);

            request.then(response => response.json()).then(responseData => {
                if(responseData.status === 'success') {
                    window.location.reload();
                }
    
                if(responseData.status === 'error') {
                    this._initFormMess(form, responseData.message);
                }
            });
        }

        return;
    }

    _removeElement(element) {
        element.remove();
    }

    _initFormMess(form, message, className='.form__mess') {
        if(this.errMessIdTimeoutId !== null) {
            clearTimeout(this.errMessIdTimeoutId);
        }

        const errorElem = form.querySelector(className);

        errorElem.textContent = message;
        this.errMessIdTimeoutId = setTimeout(() => {
            errorElem.textContent = "";
        }, 3000);
    }

    _initAuthForm() {
        const authFormTemplate = authForm.replace('{{login}}', 'login')
            .replace('{{password}}', 'password')
            .replaceAll('{{class}}', 'form-auth');
        const registerFormTemplate = registerForm.replace('{{login}}', 'login')
            .replace('{{password}}', 'password')
            .replace('{{email}}', 'email')
            .replaceAll('{{class}}', 'form-reg');
        const authFormsWrappTemplate = authTemplate.replaceAll('{{class}}', 'chaos-forms');

        this.formsWidget = new Widget("chaos-forms__wrap", authFormsWrappTemplate, "div");
        this.formsWidget.addElement(authFormTemplate, '.forms__content');
        this.formsWidget.addElement(registerFormTemplate, '.forms__content');

        this.parentNode.insertAdjacentElement('afterbegin', this.formsWidget.element);

        this.formsWidget.element.querySelectorAll('.chaos-forms [data-tab]').forEach(elem => {
            elem.addEventListener('click', this.chaosTabChecker.bind(this));
        });

        const initAuthForm = this.formsWidget.element.querySelector('.chaos-forms form[data-form=auth]');
        initAuthForm.addEventListener('submit', (event) => this.sendAuthForms(event, '/user/?method=auth'));

        const initRegisterForm = this.formsWidget.element.querySelector('.chaos-forms form[data-form=register]');
        initRegisterForm.addEventListener('submit', (event) => this.sendRegisterForms(event, '/user/?method=register'));
    }
}