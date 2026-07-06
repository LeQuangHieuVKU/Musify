package com.bd.musify.util;

import org.springframework.beans.factory.annotation.Value;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access.token.expiration}")
    private Long accessTokenExpiration;

    @Value("${jwt.refresh.token.expiration}")
    private Long refreshTokenExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateRefreshToken(Long id, String email){
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", id);
        claims.put("email", email);
        claims.put("type","REFRESH");
        return createToken(claims, email, refreshTokenExpiration);
    }

    public String generateAccessToken(Long id, String name, String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", id);
        claims.put("name", name);
        claims.put("email", email);
        claims.put("role", role);
        claims.put("type","ACCESS");
        // Continue with token generation logic
        return createToken(claims, email, accessTokenExpiration);
    }

    private String createToken(Map<String, Object> claims, String subject, Long accessTokenExpiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpiration);
        return Jwts.builder().claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public Long extractId(String token){
        return extractClaim(token,claims -> claims.get("id", Long.class));
    }

    public String extractName(String token){
        return extractClaim(token,claims -> claims.get("name", String.class));
    }

    public String extractEmail(String token){
        return extractClaim(token,claims -> claims.get("email", String.class));
    }

    public String extractRole(String token){
        return extractClaim(token,claims -> claims.get("role", String.class));
    }

    public String extractTokenType(String token){
        return extractClaim(token,claims -> claims.get("type", String.class));
    }

    public Date extractExpiration(String token){
        return extractClaim(token,Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
    }

    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, String email) {
        final String extractedEmail = extractEmail(token);
        return (extractedEmail.equals(email) && !isTokenExpired(token));
    }

    public Boolean isAccessToken(String token) {
        return "ACCESS".equals(extractTokenType(token));
    }

    public Boolean isRefreshToken(String token) {
        return "REFRESH".equals(extractTokenType(token));
    }
}
