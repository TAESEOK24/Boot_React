
package org.zerock.mallapi.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import org.zerock.mallapi.dto.PageRequestDTO;
import org.zerock.mallapi.dto.PageResponseDTO;
import org.zerock.mallapi.dto.ProductDTO;
import org.zerock.mallapi.service.ProductService;
import org.zerock.mallapi.util.CustomFileUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/products")
public class ProductController {

    private final CustomFileUtil fileUtil;
    private final ProductService productService;

    // 상품 등록 및 이미지 업로드
    @PostMapping("/")
    public Map<String, Long> register(
            @ModelAttribute ProductDTO productDTO) {

        log.info("register: " + productDTO);

        // 업로드된 파일 가져오기
        List<MultipartFile> files = productDTO.getFiles();

        // 실제 파일 저장
        List<String> uploadFileNames = fileUtil.saveFiles(files);

        // 저장된 파일명 DTO에 설정
        productDTO.setUploadFileNames(uploadFileNames);

        log.info("Uploaded files: " + uploadFileNames);

        // 서비스 계층에서 상품 DB 저장
        Long pno = productService.register(productDTO);

        return Map.of("RESULT", pno);
    }

    // 업로드된 이미지 조회
    @GetMapping("/view/{fileName:.+}")
    public ResponseEntity<Resource> viewFile(
            @PathVariable String fileName) {

        return fileUtil.getFile(fileName);
    }

    // 상품 목록 조회
    @PreAuthorize("hasAnyRole('ROLE_USER','ROLE_ADMIN')") //임시로 권한 설정
    @GetMapping("/list")
    public PageResponseDTO<ProductDTO> list(
            PageRequestDTO pageRequestDTO) {

        log.info("list: " + pageRequestDTO);

        return productService.getList(pageRequestDTO);
    }

    @GetMapping("/{tno}")
    public ProductDTO read(@PathVariable(name="tno") Long tno) {
    return productService.get(tno);
    }



@PutMapping("/{pno}")
public Map<String, String> modify(
        @PathVariable("pno") Long pno,
        @ModelAttribute ProductDTO productDTO) {

    productDTO.setPno(pno);

    // 기존 상품 조회
    ProductDTO oldProductDTO = productService.get(pno);

    // 기존 파일 목록
    List<String> oldFileNames =
            oldProductDTO.getUploadFileNames();

    // 새로 업로드한 파일 저장
    List<MultipartFile> files = productDTO.getFiles();

    List<String> currentUploadFileNames =
            fileUtil.saveFiles(files);

    // 유지할 파일 목록
    List<String> uploadedFileNames = new ArrayList<>();

    if (productDTO.getUploadFileNames() != null) {
        uploadedFileNames.addAll(
                productDTO.getUploadFileNames()
        );
    }

    // 새 파일명 추가
    uploadedFileNames.addAll(currentUploadFileNames);

    productDTO.setUploadFileNames(uploadedFileNames);

    // 상품 수정
    productService.modify(productDTO);

    // 삭제할 파일 찾기
    if (oldFileNames != null && !oldFileNames.isEmpty()) {

        List<String> removeFiles = oldFileNames
                .stream()
                .filter(fileName ->
                        !uploadedFileNames.contains(fileName))
                .collect(Collectors.toList());

        // 실제 파일 삭제
        fileUtil.deleteFiles(removeFiles);
    }

    return Map.of("RESULT", "SUCCESS");
}

    
@DeleteMapping("/{pno}")
public Map<String, String> remove(
        @PathVariable("pno") Long pno) {

    // 삭제 전 기존 상품 조회
    ProductDTO oldProductDTO = productService.get(pno);

    // 삭제해야 할 파일 목록
    List<String> oldFileNames =
            oldProductDTO.getUploadFileNames();

    // 상품 삭제
    productService.remove(pno);

    // 실제 업로드 파일 삭제
    if (oldFileNames != null && !oldFileNames.isEmpty()) {
        fileUtil.deleteFiles(oldFileNames);
    }

    return Map.of("RESULT", "SUCCESS");
}


}
