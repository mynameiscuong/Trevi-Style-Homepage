/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { Component, xml, onMounted, onWillUnmount } from "@odoo/owl";
import { mount } from "@odoo/owl";

export class AnnouncementBar extends Component {
    setup() {
        onMounted(() => this._initMarquee());
        onWillUnmount(() => this._cleanup());
    }

    _initMarquee() {
        const el = this.props.targetEl;
        const marqueeContent = el.querySelector('.marquee-content');
        if (!marqueeContent) return;

        this._clone = marqueeContent.cloneNode(true);
        this._clone.setAttribute('aria-hidden', 'true');
        marqueeContent.parentNode.appendChild(this._clone);
    }

    _cleanup() {
        if (this._clone && this._clone.parentNode) {
            this._clone.parentNode.removeChild(this._clone);
        }
    }
}

AnnouncementBar.template = xml`<div class="d-none"/>`;

publicWidget.registry.AnnouncementBar = publicWidget.Widget.extend({
    selector: '.trevi-announcement-bar',

    start() {
        this._owlContainer = document.createElement('div');
        this._owlContainer.style.display = 'none';
        this.el.appendChild(this._owlContainer);
        return mount(AnnouncementBar, this._owlContainer, {
            props: { targetEl: this.el },
        }).then((comp) => { this._owl = comp; });
    },

    destroy() {
        if (this._owl) {
            this._owl.__owl__.destroy();
        }
    },
});

export default AnnouncementBar;
