import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request, @AuthenticationPrincipal Jwt jwt) {
        // Extract a stable, immutable identifier from the token claims.
        // Replace "email" with "user_id", "oid", or whatever your immutable claim is.
        String stableUserId = jwt.getClaimAsString("email"); 
        
        if (stableUserId == null || stableUserId.isBlank()) {
            throw new UnauthorizedException("User identifier is missing from token");
        }

        return chatService.handle(request, stableUserId);
    }
}

package com.lseg.supportportal.backend.tools.aichat.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.UUID;
// ... other imports

@Service
@RequiredArgsConstructor
public class ChatService {

    private static final String CONVERSATION_ID_SEPARATOR = "::";
    private static final int MAX_CONVERSATION_ID_LENGTH = 100;

    private final ChatClient aiChatClient;
    private final ChatContext chatContext;

    public ChatResponse handle(final ChatRequest request, final String stableUserId) {
        if (stableUserId == null || stableUserId.isBlank()) {
            throw new IllegalArgumentException("stableUserId cannot be null or blank");
        }

        final String conversationId = resolveConversationId(stableUserId, request.conversationId());

        final String answer = aiChatClient.prompt()
                .user(request.message())
                .advisors(advisorSpec -> advisorSpec.param(ChatMemory.CONVERSATION_ID, conversationId))
                .call()
                .content();

        return new ChatResponse(answer, chatContext.getReasoningSteps(), chatContext.getResults().orElse(null));
    }

    private static String resolveConversationId(final String stableUserId, final String feConversationId) {
        final String localId = (feConversationId == null || feConversationId.isBlank()) 
                ? UUID.randomUUID().toString() 
                : sanitize(feConversationId);
                
        return stableUserId + CONVERSATION_ID_SEPARATOR + localId;
    }

    private static String sanitize(final String conversationId) {
        final String stripped = conversationId.strip().replace(CONVERSATION_ID_SEPARATOR, "_");
        return stripped.length() > MAX_CONVERSATION_ID_LENGTH 
                ? stripped.substring(0, MAX_CONVERSATION_ID_LENGTH) 
                : stripped;
    }
}



=====

    import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request, @AuthenticationPrincipal Jwt jwt) {
        // Extract the immutable Object ID from Entra
        String entraObjectId = jwt.getClaimAsString("oid"); 
        
        if (entraObjectId == null || entraObjectId.isBlank()) {
            throw new UnauthorizedException("Object ID (oid) is missing from token");
        }

        // Passes e.g., "a1b2c3d4-5678-90ab-cdef-111122223333" to your service
        return chatService.handle(request, entraObjectId); 
    }
}
