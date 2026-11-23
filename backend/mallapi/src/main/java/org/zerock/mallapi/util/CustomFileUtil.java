
package org.zerock.mallapi.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import net.coobird.thumbnailator.Thumbnails;

@Component
@Log4j2
@RequiredArgsConstructor
public class CustomFileUtil {

    @Value("${org.zerock.upload.path}")
    private String uploadPath;

    // 업로드 폴더 초기화
    @PostConstruct
    public void init() {

        File tempFolder = new File(uploadPath);

        if (!tempFolder.exists()) {
            tempFolder.mkdirs();
        }

        uploadPath = tempFolder.getAbsolutePath();

        log.info("-------------------------------------");
        log.info(uploadPath);
    }

    // 파일 저장 및 썸네일 생성
    public List<String> saveFiles(List<MultipartFile> files)
            throws RuntimeException {

        List<String> uploadNames = new ArrayList<>();

        if (files == null) {
            return uploadNames;
        }

        for (MultipartFile multipartFile : files) {

            if (multipartFile == null || multipartFile.isEmpty()) {
                continue;
            }

            String originalName = multipartFile.getOriginalFilename();

            if (originalName == null || originalName.isBlank()) {
                originalName = "file";
            }

            originalName = originalName.replace("\\", "/");
            originalName = originalName.substring(
                originalName.lastIndexOf("/") + 1
            );

            String savedName =
                UUID.randomUUID().toString() + "_" + originalName;

            Path savePath = Paths.get(uploadPath, savedName);

            try {

                // 원본 파일 저장
                Files.copy(multipartFile.getInputStream(), savePath);

                String contentType = multipartFile.getContentType();

                // 이미지 파일이면 썸네일 생성
                if (contentType != null
                        && contentType.startsWith("image/")) {

                    Path thumbnailPath = Paths.get(
                        uploadPath, "s_" + savedName
                    );

                    Thumbnails.of(savePath.toFile())
                        .size(200, 200)
                        .toFile(thumbnailPath.toFile());
                }

                uploadNames.add(savedName);

            } catch (IOException e) {
                throw new RuntimeException(e.getMessage(), e);
            }
        }

        return uploadNames;
    }

    // 업로드된 파일 조회
    public ResponseEntity<Resource> getFile(String fileName) {

        Path basePath = Paths.get(uploadPath)
                .toAbsolutePath()
                .normalize();

        Path requestedPath = basePath.resolve(fileName).normalize();

        // 업로드 폴더 외부 접근 방지
        if (!requestedPath.startsWith(basePath)) {
            return ResponseEntity.badRequest().build();
        }

        Resource resource = new FileSystemResource(requestedPath);

        // 요청 파일이 없으면 기본 이미지 사용
        if (!resource.exists()) {
            resource = new FileSystemResource(
                basePath.resolve("default.jpeg")
            );
        }

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();

        try {

            String contentType = Files.probeContentType(
                resource.getFile().toPath()
            );

            headers.add(
                HttpHeaders.CONTENT_TYPE,
                contentType != null
                    ? contentType
                    : "application/octet-stream"
            );

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }

        return ResponseEntity.ok()
                .headers(headers)
                .body(resource);
    }

    public void deleteFiles(List<String> fileNames) {
if(fileNames == null || fileNames.size() == 0){
return;
}
fileNames.forEach(fileName-> {
//썸네일이 있는지 확인하고 삭제 
String thumbnailFileName = "s_" + fileName;
Path thumbnailPath = Paths.get(uploadPath, thumbnailFileName);
Path filePath = Paths.get(uploadPath, fileName);
try {
Files.deleteIfExists(filePath);
Files.deleteIfExists(thumbnailPath);
} catch (IOException e) {
throw new RuntimeException(e.getMessage());
}
});

}
}
