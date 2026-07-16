/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { Component, xml, onMounted, onWillUnmount } from "@odoo/owl";
import { mount } from "@odoo/owl";

export class ServiceFeatures extends Component {
    setup() {
        onMounted(() => this._initFeatures());
        onWillUnmount(() => this._cleanup());
    }

    _initFeatures() {
        const el = this.props.targetEl;
        const items = el.querySelectorAll('.service-item');

        this._hoverHandlers = [];

        items.forEach((item) => {
            const onEnter = () => item.classList.add('service-hover');
            const onLeave = () => item.classList.remove('service-hover');

            item.addEventListener('mouseenter', onEnter);
            item.addEventListener('mouseleave', onLeave);

            this._hoverHandlers.push({
                el: item,
                handlers: [
                    { event: 'mouseenter', handler: onEnter },
                    { event: 'mouseleave', handler: onLeave },
                ],
            });
        });
    }

    _cleanup() {
        this._hoverHandlers?.forEach(({ el, handlers }) => {
            handlers.forEach(({ event, handler }) => {
                el.removeEventListener(event, handler);
            });
        });
        this._hoverHandlers = [];
    }
}

ServiceFeatures.template = xml`<div class="d-none"/>`;

publicWidget.registry.ServiceFeatures = publicWidget.Widget.extend({
    selector: '.s_service_features',

    start() {
        this._owlContainer = document.createElement('div');
        this._owlContainer.style.display = 'none';
        this.el.appendChild(this._owlContainer);
        return mount(ServiceFeatures, this._owlContainer, {
            props: { targetEl: this.el },
        }).then((comp) => { this._owl = comp; });
    },

    destroy() {
        if (this._owl) {
            this._owl.__owl__.destroy();
        }
    },
});

export default ServiceFeatures;
