package com.bd.musify.serviceImpl;

import com.bd.musify.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendCredentialsEmail(String toEmail, String userName, String password) {
        try{
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Musify - Your Temporary Password");
            String emailBody = "Hi " + userName + ",\n\n"
                    + "You received a request to reset your password. Here is your temporary password:\n\n"
                    + "Temporary Password: " + password + "\n\n"
                    + "Please use this temporary password to log in to your account .\n\n"
                    + "IMPORTANT: For security reasons, please change your password immediately after logging in.\n\n"
                    + "You can log in at " + frontendUrl + "/login\n\n"
                    + "If you did not request a password reset, please ignore this email.\n\n"
                    + "Thank you,\n"
                    + "The Musify Team";
            message.setText(emailBody);
            mailSender.send(message);

            logger.info("Temporary password email sent successfully to {}", toEmail);
        }catch (Exception e) {
            logger.error("Failed to send temporary password email to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send temporary password email");
        }
    }

    @Override
    public void sendWelcomeEmail(String toEmail, String userName, String password) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to Musify - Your Account is Ready");
            String emailBody = "Hi " + userName + ",\n\n"
                    + "Welcome to Musify! Your account has been successfully created.\n\n"
                    + "Here is your login credentials:\n\n"
                    + "Email: " + toEmail + "\n"
                    + "Temporary Password: " + password + "\n\n"
                    + "IMPORTANT: Please log in to your account using the temporary password provided above. For security reasons, we recommend that you change your password immediately after logging in.\n\n"
                    + "You can log in at " + frontendUrl + "/login\n\n"
                    + "If you have any questions or need assistance, feel free to reach out to our support team.\n\n"
                    + "Thank you for joining Musify!\n"
                    + "The Musify Team";
            message.setText(emailBody);
            mailSender.send(message);
            logger.info("Welcome email sent successfully to {}", toEmail);

        } catch (Exception e) {
            logger.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send welcome email");
        }
    }
}
