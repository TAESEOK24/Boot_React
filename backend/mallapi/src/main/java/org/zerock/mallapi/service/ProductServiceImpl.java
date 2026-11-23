
package org.zerock.mallapi.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.zerock.mallapi.domain.Product;
import org.zerock.mallapi.domain.ProductImage;
import org.zerock.mallapi.dto.ProductDTO;
import org.zerock.mallapi.dto.PageRequestDTO;
import org.zerock.mallapi.dto.PageResponseDTO;
import org.zerock.mallapi.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    // 상품 등록
    @Override
    public Long register(ProductDTO productDTO) {

        log.info("register: " + productDTO);

        // DTO를 Entity로 변환
        Product product = dtoToEntity(productDTO);

        // 상품 저장
        Product result = productRepository.save(product);

        return result.getPno();
    }

    // DTO -> Entity 변환
    private Product dtoToEntity(ProductDTO productDTO) {

        Product product = Product.builder()
                .pname(productDTO.getPname())
                .pdesc(productDTO.getPdesc())
                .price(productDTO.getPrice())
                .delFlag(productDTO.isDelFlag())
                .build();

        // 업로드 처리 완료된 파일들의 이름 리스트
        List<String> uploadFileNames =
                productDTO.getUploadFileNames();

        if (uploadFileNames == null) {
            return product;
        }

        // 업로드된 이미지 이름을 Product에 추가
        uploadFileNames.forEach(uploadName -> {
            product.addImageString(uploadName);
        });

        return product;
    }

    // 상품 목록 조회
    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<ProductDTO> getList(
            PageRequestDTO pageRequestDTO) {

        log.info("getList");

        // 페이징 설정
        Pageable pageable = PageRequest.of(
                pageRequestDTO.getPage() - 1,
                pageRequestDTO.getSize(),
                Sort.by("pno").descending()
        );

        // 상품 목록 조회
        Page<Object[]> result =
                productRepository.selectList(pageable);

        // Entity -> DTO 변환
        List<ProductDTO> dtoList = result.getContent()
                .stream()
                .map(arr -> {

                    Product product = (Product) arr[0];

                    ProductImage productImage =
                            (ProductImage) arr[1];

                    ProductDTO productDTO = ProductDTO.builder()
                            .pno(product.getPno())
                            .pname(product.getPname())
                            .pdesc(product.getPdesc())
                            .price(product.getPrice())
                            .delFlag(product.isDelFlag())
                            .build();

                    // 대표 이미지가 존재하는 경우
                    if (productImage != null) {

                        String imageStr = productImage.getFileName();

                        productDTO.setUploadFileNames(
                                List.of(imageStr)
                        );
                    }

                    return productDTO;
                })
                .collect(Collectors.toList());

        // 페이징 결과 반환
        return PageResponseDTO.<ProductDTO>withAll()
                .dtoList(dtoList)
                .pageRequestDTO(pageRequestDTO)
                .totalCount(result.getTotalElements())
                .build();
    }

    public ProductDTO get(Long pno){
        java.util.Optional<Product> result = productRepository.selectOne(pno);

        Product product = result.orElseThrow();
        ProductDTO productDTO = entityToDTO(product);
        return productDTO;
    }
    
private ProductDTO entityToDTO(Product product) {

    ProductDTO productDTO = ProductDTO.builder()
            .pno(product.getPno())
            .pname(product.getPname())
            .pdesc(product.getPdesc())
            .price(product.getPrice())
            .delFlag(product.isDelFlag())
            .build();

    List<ProductImage> imageList = product.getImageList();

    if (imageList == null || imageList.isEmpty()) {
        return productDTO;
    }

    List<String> fileNameList = imageList.stream()
            .map(ProductImage::getFileName)
            .toList();

    productDTO.setUploadFileNames(fileNameList);

    return productDTO;
    }

@Override
public void modify(ProductDTO productDTO) {

    // step1 read
    Optional<Product> result =
            productRepository.findById(productDTO.getPno());

    Product product = result.orElseThrow();

    // change pname, pdesc, price
    product.changeName(productDTO.getPname());
    product.changeDesc(productDTO.getPdesc());
    product.changePrice(productDTO.getPrice());

    // upload File - clear first
    product.clearList();

    List<String> uploadFileNames =
            productDTO.getUploadFileNames();

    if (uploadFileNames != null && uploadFileNames.size() > 0) {

        uploadFileNames.stream().forEach(uploadName -> {
            product.addImageString(uploadName);
        });
    }

    productRepository.save(product);
    }
    @Override
    public void remove(Long pno) {
    productRepository.updateToDelete(pno,true);
    }

}
