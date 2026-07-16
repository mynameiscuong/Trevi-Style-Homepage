/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { Component, xml, onMounted, onWillUnmount } from "@odoo/owl";
import { mount } from "@odoo/owl";

export class CategoryCarousel extends Component {
    setup() {
        onMounted(() => this._initCarousel());
        onWillUnmount(() => this._cleanup());
    }

    _initCarousel() {
        const el = this.props.targetEl;
        this._scrollContainer = el.querySelector('.category-scroll');
        this._prevBtn = el.querySelector('.category-nav-btn.prev');
        this._nextBtn = el.querySelector('.category-nav-btn.next');

        if (!this._scrollContainer) return;

        const container = this._scrollContainer;

        if (this._prevBtn) {
            this._onPrevClick = () => container.scrollBy({ left: -200, behavior: 'smooth' });
            this._prevBtn.addEventListener('click', this._onPrevClick);
        }

        if (this._nextBtn) {
            this._onNextClick = () => container.scrollBy({ left: 200, behavior: 'smooth' });
            this._nextBtn.addEventListener('click', this._onNextClick);
        }

        let isDown = false;
        let startX;
        let scrollLeft;

        this._onMouseDown = (e) => {
            isDown = true;
            container.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        };

        this._onMouseLeave = () => {
            isDown = false;
            container.style.cursor = 'grab';
        };

        this._onMouseUp = () => {
            isDown = false;
            container.style.cursor = 'grab';
        };

        this._onMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        };

        container.addEventListener('mousedown', this._onMouseDown);
        container.addEventListener('mouseleave', this._onMouseLeave);
        container.addEventListener('mouseup', this._onMouseUp);
        container.addEventListener('mousemove', this._onMouseMove);
        container.style.cursor = 'grab';
    }

    _cleanup() {
        const container = this._scrollContainer;
        if (!container) return;

        if (this._prevBtn && this._onPrevClick) {
            this._prevBtn.removeEventListener('click', this._onPrevClick);
        }
        if (this._nextBtn && this._onNextClick) {
            this._nextBtn.removeEventListener('click', this._onNextClick);
        }

        container.removeEventListener('mousedown', this._onMouseDown);
        container.removeEventListener('mouseleave', this._onMouseLeave);
        container.removeEventListener('mouseup', this._onMouseUp);
        container.removeEventListener('mousemove', this._onMouseMove);
    }
}

CategoryCarousel.template = xml`<div class="d-none"/>`;

publicWidget.registry.CategoryCarousel = publicWidget.Widget.extend({
    selector: '.s_category_section',

    start() {
        this._owlContainer = document.createElement('div');
        this._owlContainer.style.display = 'none';
        this.el.appendChild(this._owlContainer);
        return mount(CategoryCarousel, this._owlContainer, {
            props: { targetEl: this.el },
        }).then((comp) => { this._owl = comp; });
    },

    destroy() {
        if (this._owl) {
            this._owl.__owl__.destroy();
        }
    },
});

export default CategoryCarousel;
