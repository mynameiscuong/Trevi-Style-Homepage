FROM odoo:18.0
USER root
RUN mkdir -p /mnt/extra-addons

# Sao chép toàn bộ các module từ thư mục 'custom_addons' trên máy bạn vào máy chủ ảo
# Hãy đảm bảo thư mục chứa code custom trên máy bạn được đặt tên chính xác là 'custom_addons'
COPY ./my_custom /mnt/extra-addons

# Thiết lập phân quyền cho user 'odoo' để hệ thống đọc/ghi file bình thường
RUN chown -R odoo:odoo /mnt/extra-addons

# Trở lại user odoo mặc định để đảm bảo an toàn bảo mật khi chạy ứng dụng
USER odoo

# Lệnh khởi chạy Odoo kèm cấu hình đường dẫn addons (bao gồm core Odoo và module custom của bạn)
CMD ["odoo", "--addons-path=/usr/lib/python3/dist-packages/odoo/addons,/mnt/extra-addons"]