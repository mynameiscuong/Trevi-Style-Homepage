/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { Component, xml, onMounted, onWillUnmount } from "@odoo/owl";
import { mount } from "@odoo/owl";

export class ProductCard extends Component {
    setup() {
        onMounted(() => this._bindActions());
        onWillUnmount(() => this._cleanup());
    }

    _bindActions() {
        const el = this.props.targetEl;
        const cards = el.querySelectorAll('.product-card-flash, .product-card-grid, .product-card');

        this._clickHandlers = [];

        cards.forEach((card) => {
            const cartBtn = card.querySelector('.btn-action[title="Thêm vào giỏ"]');
            const wishlistBtn = card.querySelector('.btn-action[title="Yêu thích"]');

            if (cartBtn) {
                const handler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._addToCart(card);
                };
                cartBtn.addEventListener('click', handler);
                this._clickHandlers.push({ el: cartBtn, event: 'click', handler });
            }

            if (wishlistBtn) {
                const handler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._toggleWishlist(wishlistBtn);
                };
                wishlistBtn.addEventListener('click', handler);
                this._clickHandlers.push({ el: wishlistBtn, event: 'click', handler });
            }
        });
    }

    _addToCart(card) {
        const link = card.querySelector('a[href*="/shop/"]');
        if (link) {
            window.location.href = link.href;
        }
    }

    _toggleWishlist(btn) {
        btn.classList.toggle('active');
        const icon = btn.querySelector('i');
        if (icon) {
            if (btn.classList.contains('active')) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                icon.style.color = '#ff0000';
            } else {
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                icon.style.color = '';
            }
        }
    }

    _cleanup() {
        this._clickHandlers?.forEach(({ el, event, handler }) => {
            el.removeEventListener(event, handler);
        });
        this._clickHandlers = [];
    }
}

ProductCard.template = xml`<div class="d-none"/>`;

publicWidget.registry.ProductCard = publicWidget.Widget.extend({
    selector: '.product-card-flash, .product-card-grid, .product-card',

    start() {
        this._owlContainer = document.createElement('div');
        this._owlContainer.style.display = 'none';
        this.el.appendChild(this._owlContainer);
        return mount(ProductCard, this._owlContainer, {
            props: { targetEl: this.el },
        }).then((comp) => { this._owl = comp; });
    },

    destroy() {
        if (this._owl) {
            this._owl.__owl__.destroy();
        }
    },
});

export default ProductCard;
