from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class AttributeItem(BaseModel):
    name: str = Field(..., description="Attribute name (e.g. category, color, material, brand)")
    value: str = Field(..., description="Detected value")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Detection confidence score")

class AttributePreviewResponse(BaseModel):
    model: str = Field("microsoft/Florence-2-base", description="Model identifier used for visual attribute extraction")
    category: Optional[str] = Field(None, description="Predicted item category")
    color: Optional[str] = Field(None, description="Dominant item color")
    brand: Optional[str] = Field(None, description="Predicted brand or logo")
    attributes: List[AttributeItem] = Field(default_factory=list, description="List of granular extracted attributes")
    caption: Optional[str] = Field(None, description="Generated dense visual caption of the item")

