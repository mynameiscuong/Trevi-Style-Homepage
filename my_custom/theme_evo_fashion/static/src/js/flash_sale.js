/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { Component, xml, onMounted, onWillUnmount, useState } from "@odoo/owl";
import { mount } from "@odoo/owl";

export class FlashSale extends Component {
    setup() {
        this.state = useState({
            hours: 24,
            minutes: 0,
            seconds: 0,
        });

        onMounted(() => {
            this._initCountdown();
            this._initCarousel();
            this._loadProducts();
        });

        onWillUnmount(() => this._cleanup());
    }

    _initCountdown() {
        const el = this.props.targetEl;
        const timerEl = el.querySelector('.countdown-timer[data-countdown-hours]');
        if (!timerEl) return;

        const hours = parseInt(timerEl.dataset.countdownHours) || 24;
        const storageKey = 'trevi_flash_sale_end';

        let endTime = localStorage.getItem(storageKey);
        if (!endTime || parseInt(endTime) <= Date.now()) {
            endTime = Date.now() + hours * 60 * 60 * 1000;
            localStorage.setItem(storageKey, endTime.toString());
        }

        this._timerEl = timerEl;
        this._endTime = parseInt(endTime);

        this._updateCountdown();
        this._countdownInterval = setInterval(() => this._updateCountdown(), 1000);
    }

    _updateCountdown() {
        if (!this._timerEl || !this._endTime) return;

        let remaining = Math.floor((this._endTime - Date.now()) / 1000);

        if (remaining <= 0) {
            remaining = 0;
            const hours = parseInt(this._timerEl.dataset.countdownHours) || 24;
            this._endTime = Date.now() + hours * 60 * 60 * 1000;
            localStorage.setItem('trevi_flash_sale_end', this._endTime.toString());
        }

        const hrs = Math.floor(remaining / 3600);
        const mins = Math.floor((remaining % 3600) / 60);
        const secs = remaining % 60;

        this.state.hours = hrs;
        this.state.minutes = mins;
        this.state.seconds = secs;

        const hoursEl = this._timerEl.querySelector('[data-unit="hours"]');
        const minutesEl = this._timerEl.querySelector('[data-unit="minutes"]');
        const secondsEl = this._timerEl.querySelector('[data-unit="seconds"]');

        if (hoursEl) hoursEl.textContent = String(hrs).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(mins).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(secs).padStart(2, '0');
    }

    _initCarousel() {
        const el = this.props.targetEl;
        const productsContainer = el.querySelector('.flash-sale-products');
        const prevBtn = el.querySelector('.flash-prev');
        const nextBtn = el.querySelector('.flash-next');

        if (!productsContainer) return;

        if (prevBtn) {
            this._onPrevClick = () => productsContainer.scrollBy({ left: -250, behavior: 'smooth' });
            prevBtn.addEventListener('click', this._onPrevClick);
        }

        if (nextBtn) {
            this._onNextClick = () => productsContainer.scrollBy({ left: 250, behavior: 'smooth' });
            nextBtn.addEventListener('click', this._onNextClick);
        }

        let isDown = false;
        let startX;
        let scrollLeft;

        this._onMouseDown = (e) => {
            isDown = true;
            productsContainer.style.cursor = 'grabbing';
            startX = e.pageX - productsContainer.offsetLeft;
            scrollLeft = productsContainer.scrollLeft;
        };

        this._onMouseLeave = () => {
            isDown = false;
            productsContainer.style.cursor = 'grab';
        };

        this._onMouseUp = () => {
            isDown = false;
            productsContainer.style.cursor = 'grab';
        };

        this._onMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - productsContainer.offsetLeft;
            const walk = (x - startX) * 2;
            productsContainer.scrollLeft = scrollLeft - walk;
        };

        productsContainer.addEventListener('mousedown', this._onMouseDown);
        productsContainer.addEventListener('mouseleave', this._onMouseLeave);
        productsContainer.addEventListener('mouseup', this._onMouseUp);
        productsContainer.addEventListener('mousemove', this._onMouseMove);
        productsContainer.style.cursor = 'grab';
    }

    _loadProducts() {
        const el = this.props.targetEl;
        const productsContainer = el.querySelector('.flash-sale-products');
        if (!productsContainer) return;

        // Products are already rendered in the template, just bind events
        this._bindProductActions();
    }

    _bindProductActions() {
        const el = this.props.targetEl;
        
        // Bind quick view buttons
        const quickViewButtons = el.querySelectorAll('.icon-quickview');
        quickViewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = btn.dataset.productId;
                this._showQuickView(productId, el);
            });
        });

        // Bind wishlist buttons
        const wishlistButtons = el.querySelectorAll('.setWishlist');
        wishlistButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                btn.classList.toggle('active');
                const icon = btn.querySelector('svg');
                if (icon) {
                    if (btn.classList.contains('active')) {
                        icon.style.color = '#ff0000';
                        icon.style.fill = '#ff0000';
                    } else {
                        icon.style.color = '';
                        icon.style.fill = 'none';
                    }
                }
            });
        });

        // Bind quantity selectors
        const qtyWrappers = el.querySelectorAll('.actions-wrapqty');
        qtyWrappers.forEach(wrapper => {
            const minusBtn = wrapper.querySelector('.proloop-minus');
            const plusBtn = wrapper.querySelector('.proloop-plus');
            const input = wrapper.querySelector('.proloop-value');

            if (minusBtn && plusBtn && input) {
                minusBtn.addEventListener('click', () => {
                    let value = parseInt(input.value) || 1;
                    if (value > 1) {
                        input.value = value - 1;
                    }
                });

                plusBtn.addEventListener('click', () => {
                    let value = parseInt(input.value) || 1;
                    input.value = value + 1;
                });
            }
        });

        // Initialize text carousel
        this._initTextCarousel(el);

        // Initialize modal
        this._initQuickViewModal();
    }

    _initTextCarousel(el) {
        const textCarousel = el.querySelector('.text-flashsale');
        if (!textCarousel) return;

        if (typeof $ !== 'undefined' && $.fn.owlCarousel) {
            $(textCarousel).owlCarousel({
                items: 1,
                loop: true,
                nav: false,
                dots: false,
                autoplay: true,
                autoplayTimeout: 4000,
                autoplayHoverPause: true,
                animateOut: 'fadeOut',
                animateIn: 'fadeIn'
            });
        }
    }

    _initQuickViewModal() {
        // Create modal if it doesn't exist
        if (!document.getElementById('quickviewModal')) {
            const modalHTML = `
                <div class="quickview-modal" id="quickviewModal">
                    <div class="quickview-content">
                        <button class="quickview-close" id="quickviewClose">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                        <div class="quickview-body" id="quickviewBody">
                            <!-- Product details will be loaded here dynamically -->
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // Bind close button
        const closeBtn = document.getElementById('quickviewClose');
        if (closeBtn) {
            this._onCloseModal = () => this._hideQuickView();
            closeBtn.addEventListener('click', this._onCloseModal);
        }

        // Close on overlay click
        const modal = document.getElementById('quickviewModal');
        if (modal) {
            this._onOverlayClick = (e) => {
                if (e.target === modal) {
                    this._hideQuickView();
                }
            };
            modal.addEventListener('click', this._onOverlayClick);
        }

        // Close on escape key
        this._onEscapeKey = (e) => {
            if (e.key === 'Escape') {
                this._hideQuickView();
            }
        };
        document.addEventListener('keydown', this._onEscapeKey);
    }

    _showQuickView(productId, el) {
        const productItem = el.querySelector(`[data-product-id="${productId}"]`).closest('.flash-sale-item');
        const productName = productItem.querySelector('h3 a').textContent;
        const priceEl = productItem.querySelector('.price');
        const price = priceEl ? priceEl.textContent : '';
        const oldPriceEl = productItem.querySelector('.price-del');
        const oldPrice = oldPriceEl ? oldPriceEl.textContent : '';
        const discountEl = productItem.querySelector('.pro-percent');
        const discount = discountEl ? discountEl.textContent : '';

        const modalBody = document.getElementById('quickviewBody');
        modalBody.innerHTML = `
            <div class="quickview-image">
                <img src="/my_custom/theme_evo_fashion/static/src/img/shopping.webp" alt="${productName}">
                <div class="quickview-thumbnails">
                    <div class="thumb active">
                        <img src="/my_custom/theme_evo_fashion/static/src/img/shopping.webp" alt="${productName}">
                    </div>
                    <div class="thumb">
                        <img src="/my_custom/theme_evo_fashion/static/src/img/shopping.webp" alt="${productName}">
                    </div>
                    <div class="thumb">
                        <img src="/my_custom/theme_evo_fashion/static/src/img/shopping.webp" alt="${productName}">
                    </div>
                </div>
            </div>
            <div class="quickview-info">
                <span class="quickview-status">Còn hàng</span>
                <div class="quickview-brand">Thương hiệu: Trevi Lens</div>
                <h3 class="quickview-title">${productName}</h3>
                <div class="quickview-price">
                    <span class="current-price">${price}</span>
                    ${oldPrice ? `<span class="old-price">${oldPrice}</span>` : ''}
                    ${discount ? `<span class="discount">${discount}</span>` : ''}
                </div>
                <div class="quickview-options">
                    <div class="option-label">Màu sắc:</div>
                    <div class="color-options">
                        <div class="color-option active" style="background-color: #D4A574;" title="Be"></div>
                        <div class="color-option" style="background-color: #1a1a1a;" title="Đen"></div>
                    </div>
                    <div class="option-label">Kích thước:</div>
                    <div class="size-options">
                        <div class="size-option">S</div>
                        <div class="size-option active">M</div>
                        <div class="size-option">L</div>
                    </div>
                </div>
                <div class="quickview-quantity">
                    <span class="qty-label">Số lượng:</span>
                    <input type="number" class="qty-input" value="1" min="1">
                </div>
                <div class="quickview-actions">
                    <button class="btn-add-cart">THÊM VÀO GIỎ</button>
                </div>
                <div class="quickview-social">
                    <a href="#" class="social-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                    </a>
                    <a href="#" class="social-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                    </a>
                    <a href="#" class="social-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                </div>
                <a href="/shop/${productId}" class="quickview-link">Xem chi tiết sản phẩm →</a>
            </div>
        `;

        // Bind thumbnail clicks
        const thumbs = modalBody.querySelectorAll('.thumb');
        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                thumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                const mainImg = modalBody.querySelector('.quickview-image > img');
                mainImg.src = thumb.querySelector('img').src;
            });
        });

        // Bind color options
        const colorOptions = modalBody.querySelectorAll('.color-option');
        colorOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                colorOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            });
        });

        // Bind size options
        const sizeOptions = modalBody.querySelectorAll('.size-option');
        sizeOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                sizeOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            });
        });

        // Show modal
        const modal = document.getElementById('quickviewModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    _hideQuickView() {
        const modal = document.getElementById('quickviewModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    _formatPrice(price) {
        return new Intl.NumberFormat('vi-VN').format(price) + '\u20ab';
    }

    _cleanup() {
        if (this._countdownInterval) {
            clearInterval(this._countdownInterval);
        }

        const el = this.props.targetEl;
        const productsContainer = el?.querySelector('.flash-sale-products');
        const prevBtn = el?.querySelector('.flash-prev');
        const nextBtn = el?.querySelector('.flash-next');

        if (prevBtn && this._onPrevClick) {
            prevBtn.removeEventListener('click', this._onPrevClick);
        }
        if (nextBtn && this._onNextClick) {
            nextBtn.removeEventListener('click', this._onNextClick);
        }
        if (productsContainer) {
            productsContainer.removeEventListener('mousedown', this._onMouseDown);
            productsContainer.removeEventListener('mouseleave', this._onMouseLeave);
            productsContainer.removeEventListener('mouseup', this._onMouseUp);
            productsContainer.removeEventListener('mousemove', this._onMouseMove);
        }

        // Remove product action listeners
        const quickViewButtons = el?.querySelectorAll('.icon-quickview');
        quickViewButtons?.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        
        const wishlistButtons = el?.querySelectorAll('.setWishlist');
        wishlistButtons?.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });

        // Remove modal event listeners
        const closeBtn = document.getElementById('quickviewClose');
        if (closeBtn && this._onCloseModal) {
            closeBtn.removeEventListener('click', this._onCloseModal);
        }

        const modal = document.getElementById('quickviewModal');
        if (modal && this._onOverlayClick) {
            modal.removeEventListener('click', this._onOverlayClick);
        }

        if (this._onEscapeKey) {
            document.removeEventListener('keydown', this._onEscapeKey);
        }

        // Remove modal from DOM
        if (modal) {
            modal.remove();
        }
    }
}

FlashSale.template = xml`<div class="d-none"/>`;

publicWidget.registry.FlashSale = publicWidget.Widget.extend({
    selector: '.s_flash_sale',

    start() {
        this._owlContainer = document.createElement('div');
        this._owlContainer.style.display = 'none';
        this.el.appendChild(this._owlContainer);
        return mount(FlashSale, this._owlContainer, {
            props: { targetEl: this.el },
        }).then((comp) => { this._owl = comp; });
    },

    destroy() {
        if (this._owl) {
            this._owl.__owl__.destroy();
        }
    },
});

export default FlashSale;
