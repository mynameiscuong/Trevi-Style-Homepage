# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request


class Main(http.Controller):

    @http.route('/', type='http', auth='public', website=True, sitemap=True)
    def index(self, **kw):
        return request.render('theme_evo_fashion.homepage')

    @http.route('/theme_evo_fashion/flash_sale_products', type='json', auth='public', website=True)
    def flash_sale_products(self, **kw):
        products = request.env['product.template'].sudo().search([
            ('is_published', '=', True),
        ], limit=8, order='website_sequence')

        product_data = []
        for product in products:
            product_data.append({
                'id': product.id,
                'name': product.name,
                'price': product.list_price,
                'compare_price': product.compare_list_price or 0,
                'url': '/shop/%s' % product.id,
            })

        return {'products': product_data}
