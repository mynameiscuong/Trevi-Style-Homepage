/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { Component, xml, onMounted, onWillUnmount } from "@odoo/owl";
import { mount } from "@odoo/owl";

export class TreviFooter extends Component {
    setup() {
        onMounted(() => this._initNewsletter());
        onWillUnmount(() => this._cleanup());
    }

    _initNewsletter() {
        const el = this.props.targetEl;
        const form = el.querySelector('.newsletter-form');
        if (!form) return;

        this._onSubmit = (e) => {
            e.preventDefault();
            const input = form.querySelector('.form-control');
            if (input && input.value.trim()) {
                const email = input.value.trim();
                if (this._isValidEmail(email)) {
                    this._subscribeNewsletter(email, input, el);
                }
            }
        };

        form.addEventListener('submit', this._onSubmit);
        this._form = form;
    }

    _isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    _subscribeNewsletter(email, input, el) {
        const btn = el.querySelector('.btn-subscribe');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = 'Đang gửi...';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = 'Đã đăng ký!';
                input.value = '';

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 2000);
            }, 1000);
        }
    }

    _cleanup() {
        if (this._form && this._onSubmit) {
            this._form.removeEventListener('submit', this._onSubmit);
        }
    }
}

TreviFooter.template = xml`<div class="d-none"/>`;

publicWidget.registry.TreviFooter = publicWidget.Widget.extend({
    selector: '.trevi-footer',

    start() {
        this._owlContainer = document.createElement('div');
        this._owlContainer.style.display = 'none';
        this.el.appendChild(this._owlContainer);
        return mount(TreviFooter, this._owlContainer, {
            props: { targetEl: this.el },
        }).then((comp) => { this._owl = comp; });
    },

    destroy() {
        if (this._owl) {
            this._owl.__owl__.destroy();
        }
    },
});

export default TreviFooter;
