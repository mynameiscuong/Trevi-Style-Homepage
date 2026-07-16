/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { Component, xml, onMounted, onWillUnmount } from "@odoo/owl";
import { mount } from "@odoo/owl";

export class ProductTabs extends Component {
    setup() {
        onMounted(() => this._initTabs());
        onWillUnmount(() => this._cleanup());
    }

    _initTabs() {
        const el = this.props.targetEl;
        const tabBtns = el.querySelectorAll('.tab-btn');
        const tabPanes = el.querySelectorAll('.tab-pane');

        this._tabHandlers = [];

        tabBtns.forEach((btn) => {
            const handler = () => {
                const tabId = btn.dataset.tab;

                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const targetPane = el.querySelector(`#tab-${tabId}`);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            };

            this._tabHandlers.push({ btn, handler });
            btn.addEventListener('click', handler);
        });
    }

    _cleanup() {
        this._tabHandlers?.forEach(({ btn, handler }) => {
            btn.removeEventListener('click', handler);
        });
        this._tabHandlers = [];
    }
}

ProductTabs.template = xml`<div class="d-none"/>`;

publicWidget.registry.ProductTabs = publicWidget.Widget.extend({
    selector: '.s_product_tabs',

    start() {
        this._owlContainer = document.createElement('div');
        this._owlContainer.style.display = 'none';
        this.el.appendChild(this._owlContainer);
        return mount(ProductTabs, this._owlContainer, {
            props: { targetEl: this.el },
        }).then((comp) => { this._owl = comp; });
    },

    destroy() {
        if (this._owl) {
            this._owl.__owl__.destroy();
        }
    },
});

export default ProductTabs;
