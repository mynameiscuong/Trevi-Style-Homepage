/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { Component, xml, onMounted, onWillUnmount } from "@odoo/owl";
import { mount } from "@odoo/owl";

export class HomePage extends Component {
    setup() {
        onMounted(() => this._initScrollAnimations());
        onWillUnmount(() => this._cleanup());
    }

    _initScrollAnimations() {
        const el = this.props.targetEl;
        const sections = el.querySelectorAll('section[data-name]');

        if (!('IntersectionObserver' in window)) return;

        this._observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-visible');
                    this._observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
        });

        sections.forEach((section) => {
            section.classList.add('section-animate');
            this._observer.observe(section);
        });
    }

    _cleanup() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    }
}

HomePage.template = xml`<div class="d-none"/>`;

publicWidget.registry.HomePage = publicWidget.Widget.extend({
    selector: '.oe_structure',

    start() {
        this._owlContainer = document.createElement('div');
        this._owlContainer.style.display = 'none';
        this.el.appendChild(this._owlContainer);
        return mount(HomePage, this._owlContainer, {
            props: { targetEl: this.el },
        }).then((comp) => { this._owl = comp; });
    },

    destroy() {
        if (this._owl) {
            this._owl.__owl__.destroy();
        }
    },
});

export default HomePage;
