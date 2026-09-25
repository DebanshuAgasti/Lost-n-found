package com.lostfound.event;

import com.lostfound.model.entity.LostItem;

public record LostItemCreatedEvent(LostItem lostItem) {
}
