/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { Component, xml, onMounted, onWillUnmount } from "@odoo/owl";
import { mount } from "@odoo/owl";

export class BannerGrid extends Component {
    setup() {
        onMounted(() => this._initBannerGrid());
        onWillUnmount(() => this._cleanup());
    }

    _initBannerGrid() {
        const el = this.props.targetEl;
        this._banners = el.querySelectorAll('.banner-item');

        this._banners.forEach((banner) => {
            const bg = banner.querySelector('.banner-bg');
            if (bg) {
                banner.addEventListener('mouseenter', () => {
                    bg.style.transform = 'scale(1.06)';
                });
                banner.addEventListener('mouseleave', () => {
                    bg.style.transform = 'scale(1)';
                });
            }
        });
    }

    _cleanup() {
        this._banners?.forEach((banner) => {
            banner.onmouseenter = null;
            banner.onmouseleave = null;
        });
    }
}

BannerGrid.template = xml`<div class="d-none"/>`;

publicWidget.registry.BannerGrid = publicWidget.Widget.extend({
    selector: '.s_fashion_banners',

    start() {
        this._owlContainer = document.createElement('div');
        this._owlContainer.style.display = 'none';
        this.el.appendChild(this._owlContainer);
        return mount(BannerGrid, this._owlContainer, {
            props: { targetEl: this.el },
        }).then((comp) => { this._owl = comp; });
    },

    destroy() {
        if (this._owl) {
            this._owl.__owl__.destroy();
        }
    },
});

export default BannerGrid;
