
package org.zerock.mallapi.security.filter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import org.zerock.mallapi.dto.MemberDTO;
import org.zerock.mallapi.util.JWTUtil;

import com.google.gson.Gson;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.extern.log4j.Log4j2;

@Log4j2
public class JWTCheckFilter extends OncePerRequestFilter {

    // JWT 검사를 하지 않을 요청 설정
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request)
            throws ServletException {

        // OPTIONS 요청 제외
        if (request.getMethod().equals("OPTIONS")) {
            return true;
        }

        String path = request.getRequestURI();

        log.info("check uri.............." + path);

        // 회원 관련 경로 제외
        if (path.startsWith("/api/member/")) {
            return true;
        }

        // 상품 이미지 조회 경로 제외
        if (path.startsWith("/api/products/view/")) {
            return true;
        }

        return false;
    }

    // JWT Access Token 검사
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        log.info("-------------JWTCheckFilter-------------");

        String authHeaderStr =
                request.getHeader("Authorization");

        try {

            // Bearer 토큰 확인
            if (authHeaderStr == null ||
                    !authHeaderStr.startsWith("Bearer ")) {
                throw new RuntimeException("Access Token Missing");
            }

            // Access Token 추출
            String accessToken = authHeaderStr.substring(7);

            // JWT 검증
            Map<String, Object> claims =
                    JWTUtil.validateToken(accessToken);

            // JWT Claims에서 사용자 정보 추출
            String email = (String) claims.get("email");
            String pw = (String) claims.getOrDefault("pw", "");
            String nickname = (String) claims.get("nickname");

            boolean social = Boolean.parseBoolean(
                    String.valueOf(claims.get("social"))
            );

            // 사용자 권한 목록
            Object roles = claims.get("roleNames");

            List<String> roleNames =
                    roles instanceof List<?> roleList
                            ? roleList.stream()
                                    .map(String::valueOf)
                                    .toList()
                            : List.of();

            if (email == null || email.isBlank()) {
                throw new RuntimeException("Invalid Token Claims");
            }

            // JWT 인증 정보로 MemberDTO 생성
            MemberDTO memberDTO = new MemberDTO(
                    email,
                    pw,
                    nickname,
                    social,
                    roleNames
            );

            log.info("Authenticated member: {}", email);
            log.info(memberDTO.getAuthorities());

            // Spring Security 인증 객체 생성
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(
                            memberDTO,
                            null,
                            memberDTO.getAuthorities()
                    );

            // SecurityContext에 인증 정보 저장
            SecurityContextHolder.getContext()
                    .setAuthentication(authenticationToken);

        } catch (Exception e) {

            log.error("JWT Check Error..............");
            log.error(e.getMessage());

            SecurityContextHolder.clearContext();

            Gson gson = new Gson();

            String msg = gson.toJson(
                    Map.of("error", "ERROR_ACCESS_TOKEN")
            );

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED
            );

            response.setContentType(
                    "application/json;charset=UTF-8"
            );

            response.getWriter().println(msg);
            return;
        }

        // JWT 인증 성공 시 요청 통과
        filterChain.doFilter(request, response);
    }
}
