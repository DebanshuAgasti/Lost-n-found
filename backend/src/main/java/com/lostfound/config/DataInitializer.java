package com.lostfound.config;

import com.lostfound.model.entity.*;
import com.lostfound.model.enums.*;
import com.lostfound.repository.*;
import com.lostfound.service.CandidateMatchService;
import com.lostfound.service.ImageEmbeddingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;

@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImageEmbeddingService embeddingService;
    private final CandidateMatchService matchService;

    public DataInitializer(UserRepository userRepository,
                           LostItemRepository lostItemRepository,
                           FoundItemRepository foundItemRepository,
                           PasswordEncoder passwordEncoder,
                           ImageEmbeddingService embeddingService,
                           CandidateMatchService matchService) {
        this.userRepository = userRepository;
        this.lostItemRepository = lostItemRepository;
        this.foundItemRepository = foundItemRepository;
        this.passwordEncoder = passwordEncoder;
        this.embeddingService = embeddingService;
        this.matchService = matchService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        log.info("Seeding initial lost & found demo data...");

        // 1. Seed users
        User alex = new User("alex@example.com", passwordEncoder.encode("password123"), "Alex Mercer", "+1-555-0101", Role.ROLE_USER);
        User sarah = new User("sarah@example.com", passwordEncoder.encode("password123"), "Sarah Chen", "+1-555-0102", Role.ROLE_USER);
        User admin = new User("admin@example.com", passwordEncoder.encode("admin123"), "Platform Administrator", "+1-555-0999", Role.ROLE_ADMIN);

        userRepository.save(alex);
        userRepository.save(sarah);
        userRepository.save(admin);

        // 2. Seed Lost Item: iPhone 15 Pro
        LostItem lostPhone = new LostItem();
        lostPhone.setUser(alex);
        lostPhone.setTitle("Black iPhone 15 Pro in Dark Blue Silicone Case");
        lostPhone.setDescription("Left on a wooden desk on the 2nd floor of Central Campus Library near quiet study carrels.");
        lostPhone.setCategory(ItemCategory.ELECTRONICS);
        lostPhone.setStatus(LostItemStatus.ACTIVE);
        lostPhone.setLostDate(LocalDate.now().minusDays(1));
        lostPhone.setLostTime(LocalTime.of(14, 30));
        lostPhone.setLocationName("Central Campus Library - 2nd Floor");
        lostPhone.setAddress("100 University Avenue");
        lostPhone.setCity("Seattle");
        lostPhone.setLatitude(47.6553);
        lostPhone.setLongitude(-122.3035);
        lostPhone.setRewardAmount(new BigDecimal("50.00"));
        lostPhone.setContactPreference(ContactPreference.EMAIL);
        lostPhone.setContactEmail("alex@example.com");

        ItemAttributes phoneAttr = new ItemAttributes();
        phoneAttr.setBrand("Apple");
        phoneAttr.setModel("iPhone 15 Pro");
        phoneAttr.setPrimaryColor("Black");
        phoneAttr.setSecondaryColor("Blue");
        phoneAttr.setStickersOrAccessories("Blue silicone MagSafe case with small NASA sticker on bottom left corner");
        phoneAttr.setScratchesOrDamage("Tiny hairline scratch on top-right bezel");
        lostPhone.setAttributes(phoneAttr);

        // Synthetic embedding for demo item image
        byte[] mockPhoneImageBytes = "mock-iphone-15-pro-black-silicone-case-image-data".getBytes(StandardCharsets.UTF_8);
        float[] phoneEmbedding = embeddingService.generateEmbedding(mockPhoneImageBytes, "image/jpeg");
        ItemImage phoneImg = new ItemImage("/api/images/demo-iphone-lost.jpg", "uploads/demo-iphone-lost.jpg", "iphone15.jpg", 102400L, "image/jpeg", true, phoneEmbedding);
        lostPhone.addImage(phoneImg);

        lostItemRepository.save(lostPhone);

        // 3. Seed Found Item: iPhone found by Sarah
        FoundItem foundPhone = new FoundItem();
        foundPhone.setUser(sarah);
        foundPhone.setTitle("Apple Smartphone with Dark Case");
        foundPhone.setDescription("Discovered on study table in library. Dark blue case with a space/rocket sticker.");
        foundPhone.setCategory(ItemCategory.ELECTRONICS);
        foundPhone.setStatus(FoundItemStatus.ACTIVE);
        foundPhone.setFoundDate(LocalDate.now());
        foundPhone.setFoundTime(LocalTime.of(15, 0));
        foundPhone.setLocationName("Central Library Study Hall");
        foundPhone.setAddress("100 University Avenue");
        foundPhone.setCity("Seattle");
        foundPhone.setLatitude(47.6555);
        foundPhone.setLongitude(-122.3033);
        foundPhone.setStorageLocation("Campus Security Desk 2");
        foundPhone.setCurrentCustodian("Officer Miller");
        foundPhone.setVerificationQuestion("What lock screen wallpaper is displayed or what unique sticker is on the back?");

        ItemAttributes foundPhoneAttr = new ItemAttributes();
        foundPhoneAttr.setBrand("Apple");
        foundPhoneAttr.setModel("iPhone");
        foundPhoneAttr.setPrimaryColor("Dark Gray / Black");
        foundPhoneAttr.setSecondaryColor("Blue");
        foundPhoneAttr.setStickersOrAccessories("Silicone case with round NASA sticker");
        foundPhone.setAttributes(foundPhoneAttr);

        // Very similar synthetic image embedding to simulate match
        byte[] mockFoundPhoneBytes = "mock-iphone-15-pro-black-silicone-case-image-data-found".getBytes(StandardCharsets.UTF_8);
        float[] foundPhoneEmbedding = embeddingService.generateEmbedding(mockFoundPhoneBytes, "image/jpeg");
        ItemImage foundPhoneImg = new ItemImage("/api/images/demo-iphone-found.jpg", "uploads/demo-iphone-found.jpg", "found_phone.jpg", 98500L, "image/jpeg", true, foundPhoneEmbedding);
        foundPhone.addImage(foundPhoneImg);

        foundItemRepository.save(foundPhone);

        // 4. Seed another Lost Item: Leather Wallet
        LostItem lostWallet = new LostItem();
        lostWallet.setUser(alex);
        lostWallet.setTitle("Brown Leather Bifold Wallet");
        lostWallet.setDescription("Contains student ID and driver's license. Lost somewhere in Student Union.");
        lostWallet.setCategory(ItemCategory.WALLET_AND_PURSE);
        lostWallet.setStatus(LostItemStatus.ACTIVE);
        lostWallet.setLostDate(LocalDate.now().minusDays(3));
        lostWallet.setLocationName("Student Union Building");
        lostWallet.setCity("Seattle");
        lostWallet.setLatitude(47.6560);
        lostWallet.setLongitude(-122.3050);

        ItemAttributes walletAttr = new ItemAttributes();
        walletAttr.setBrand("Bellroy");
        walletAttr.setPrimaryColor("Brown");
        walletAttr.setDistinctiveMarks("Initials AM embossed on inside flap");
        lostWallet.setAttributes(walletAttr);

        lostItemRepository.save(lostWallet);

        // 5. Trigger initial matching
        matchService.runMatchingForLostItem(lostPhone);
        matchService.runMatchingForLostItem(lostWallet);

        log.info("Initial demo data seeded successfully with test users, items, and candidate matches!");
    }
}
