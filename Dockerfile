FROM nginx:alpine

# Copy pre-built application (build folder already exists)
COPY build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Add health check endpoint
RUN echo '<html><body>healthy</body></html>' > /usr/share/nginx/html/health.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
