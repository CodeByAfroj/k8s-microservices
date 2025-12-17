1.kubectl rollout status deployment manager

kubectl rollout restart deployment manager


# upstream auth_service {
#     server auth:3000;
# }

# upstream users_service {
#     server users:4000;
# }

# server {
#     listen 80;
#     server_name _;

#     root /usr/share/nginx/html;
#     index index.html;

#     location / {
#         try_files $uri $uri/ /index.html;
#     }

#     # AUTH SERVICE ROUTES
#     location /api/v1/auth/ {
#         proxy_pass http://auth_service/api/v1/auth/;
#         proxy_http_version 1.1;

#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#     }

#     # USER SERVICE ROUTES
#     location /api/v1/users/ {
#         proxy_pass http://users_service/api/v1/users/;
#         proxy_http_version 1.1;

#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#     }
# }
