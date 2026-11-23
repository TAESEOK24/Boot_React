
package org.zerock.mallapi.security.handler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.zerock.mallapi.dto.MemberDTO;
import org.zerock.mallapi.util.JWTUtil;

import com.google.gson.Gson;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.extern.log4j.Log4j2;

@Log4j2
public class APILoginSuccessHandler
        implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        log.info("Login Success Handler");

        MemberDTO memberDTO =
                (MemberDTO) authentication.getPrincipal();

        // JWT에 저장할 사용자 정보
        Map<String, Object> claims = new HashMap<>();

        claims.put("email", memberDTO.getEmail());
        claims.put("nickname", memberDTO.getNickname());
        claims.put("social", memberDTO.isSocial());
        claims.put("roleNames", memberDTO.getRoleNames());

        // Access Token: 10분
        String accessToken =
                JWTUtil.generateToken(claims, 10);

        // Refresh Token: 24시간
        String refreshToken =
                JWTUtil.generateToken(claims, 60 * 24);

        // 로그인 응답 생성
        Map<String, Object> result = new HashMap<>(claims);

        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken);

        Gson gson = new Gson();
        String jsonStr = gson.toJson(result);

        response.setContentType(
                "application/json;charset=UTF-8"
        );

        response.getWriter().println(jsonStr);
    }
}
