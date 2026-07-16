# -*- coding: utf-8 -*-
from odoo import api, models


class ThemeUtils(models.AbstractModel):
    _inherit = 'theme.utils'

    @api.model
    def _theme_evo_fashion_post_copy(self, mod):
        self.enable_view('website.template_header_sales_one')
        self.enable_view('website.template_footer_descriptive')
        self._reset_default_config()
