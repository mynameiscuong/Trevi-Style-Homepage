/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { Component, xml, onMounted, onWillUnmount, useState } from "@odoo/owl";
import { mount } from "@odoo/owl";

export class HeroSlider extends Component {
    setup() {
        this.state = useState({
            currentIndex: 0,
            isTransitioning: false,
        });

        this._autoPlayDelay = 5000;
        this._autoPlayInterval = null;

        onMounted(() => this._initSlider());
        onWillUnmount(() => this._cleanup());
    }

    _initSlider() {
        const el = this.props.targetEl;
        this._slides = el.querySelectorAll('.hero-slide');
        this._dots = el.querySelectorAll('.hero-slider-dots .dot');
        this._prevBtn = el.querySelector('.hero-slider-prev');
        this._nextBtn = el.querySelector('.hero-slider-next');

        if (this._slides.length === 0) return;

        this._bindEvents(el);

        if (this._slides.length > 1) {
            this._startAutoPlay();
        }
    }

    _bindEvents(el) {
        this._dotClickHandlers = [];
        this._dots.forEach((dot, index) => {
            const handler = () => {
                this._stopAutoPlay();
                this._goToSlide(index);
                this._startAutoPlay();
            };
            this._dotClickHandlers.push(handler);
            dot.addEventListener('click', handler);
        });

        if (this._prevBtn) {
            this._onPrevClick = () => {
                this._stopAutoPlay();
                this._prevSlide();
                this._startAutoPlay();
            };
            this._prevBtn.addEventListener('click', this._onPrevClick);
        }

        if (this._nextBtn) {
            this._onNextClick = () => {
                this._stopAutoPlay();
                this._nextSlide();
                this._startAutoPlay();
            };
            this._nextBtn.addEventListener('click', this._onNextClick);
        }

        this._onMouseEnter = () => this._stopAutoPlay();
        this._onMouseLeave = () => this._startAutoPlay();
        el.addEventListener('mouseenter', this._onMouseEnter);
        el.addEventListener('mouseleave', this._onMouseLeave);

        el.setAttribute('tabindex', '0');
        this._onKeydown = (e) => {
            if (e.key === 'ArrowLeft') {
                this._stopAutoPlay();
                this._prevSlide();
                this._startAutoPlay();
            } else if (e.key === 'ArrowRight') {
                this._stopAutoPlay();
                this._nextSlide();
                this._startAutoPlay();
            }
        };
        el.addEventListener('keydown', this._onKeydown);

        let touchStartX = 0;
        this._onTouchStart = (e) => {
            touchStartX = e.changedTouches[0].screenX;
            this._stopAutoPlay();
        };
        this._onTouchEnd = (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? this._nextSlide() : this._prevSlide();
            }
            this._startAutoPlay();
        };

        el.addEventListener('touchstart', this._onTouchStart, { passive: true });
        el.addEventListener('touchend', this._onTouchEnd, { passive: true });
    }

    _goToSlide(index) {
        if (this.state.isTransitioning || index === this.state.currentIndex) return;
        this.state.isTransitioning = true;

        this._slides.forEach(slide => slide.classList.remove('active'));
        this._dots.forEach(dot => dot.classList.remove('active'));

        if (this._slides[index]) {
            this._slides[index].classList.add('active');
        }
        if (this._dots[index]) {
            this._dots[index].classList.add('active');
        }

        this.state.currentIndex = index;

        setTimeout(() => {
            this.state.isTransitioning = false;
        }, 800);
    }

    _nextSlide() {
        const nextIndex = (this.state.currentIndex + 1) % this._slides.length;
        this._goToSlide(nextIndex);
    }

    _prevSlide() {
        const prevIndex = (this.state.currentIndex - 1 + this._slides.length) % this._slides.length;
        this._goToSlide(prevIndex);
    }

    _startAutoPlay() {
        this._stopAutoPlay();
        if (this._slides.length <= 1) return;
        this._autoPlayInterval = setInterval(() => this._nextSlide(), this._autoPlayDelay);
    }

    _stopAutoPlay() {
        if (this._autoPlayInterval) {
            clearInterval(this._autoPlayInterval);
            this._autoPlayInterval = null;
        }
    }

    _cleanup() {
        this._stopAutoPlay();

        const el = this.props.targetEl;
        if (!el) return;

        this._dots?.forEach((dot, i) => {
            if (this._dotClickHandlers?.[i]) {
                dot.removeEventListener('click', this._dotClickHandlers[i]);
            }
        });

        if (this._prevBtn && this._onPrevClick) {
            this._prevBtn.removeEventListener('click', this._onPrevClick);
        }
        if (this._nextBtn && this._onNextClick) {
            this._nextBtn.removeEventListener('click', this._onNextClick);
        }

        el.removeEventListener('mouseenter', this._onMouseEnter);
        el.removeEventListener('mouseleave', this._onMouseLeave);
        el.removeEventListener('keydown', this._onKeydown);
        el.removeEventListener('touchstart', this._onTouchStart);
        el.removeEventListener('touchend', this._onTouchEnd);
    }
}

HeroSlider.template = xml`<div class="d-none"/>`;

publicWidget.registry.HeroSlider = publicWidget.Widget.extend({
    selector: '.s_hero_slider',

    start() {
        this._owlContainer = document.createElement('div');
        this._owlContainer.style.display = 'none';
        this.el.appendChild(this._owlContainer);
        return mount(HeroSlider, this._owlContainer, {
            props: { targetEl: this.el },
        }).then((comp) => { this._owl = comp; });
    },

    destroy() {
        if (this._owl) {
            this._owl.__owl__.destroy();
        }
    },
});

export default HeroSlider;
