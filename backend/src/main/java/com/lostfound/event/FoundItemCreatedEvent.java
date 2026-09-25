package com.lostfound.event;

import com.lostfound.model.entity.FoundItem;

public record FoundItemCreatedEvent(FoundItem foundItem) {
}
