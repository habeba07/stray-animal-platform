  const handleOrderNow = (itemOrSuggestion) => {
    // Check if it's a procurement suggestion or regular item
    if (itemOrSuggestion.item_name) {
      // It's a procurement suggestion
      const suggestionItem = {
        id: itemOrSuggestion.item_id,
        name: itemOrSuggestion.item_name,
        quantity: itemOrSuggestion.current_stock,
        minimum_threshold: itemOrSuggestion.current_stock, // Use current as base
        unit: itemOrSuggestion.item?.unit || '',
        cost_per_unit: itemOrSuggestion.estimated_cost / itemOrSuggestion.suggested_quantity,
        preferred_supplier: itemOrSuggestion.preferred_supplier
      };
      setSelectedItem(suggestionItem);
      setOrderForm({
        quantity: itemOrSuggestion.suggested_quantity,
        supplier_id: suggestionItem.preferred_supplier || '',
      });
    } else {
      // It's a regular item
      setSelectedItem(itemOrSuggestion);
      setOrderForm({
        quantity: itemOrSuggestion.minimum_threshold * 2 - itemOrSuggestion.quantity,
        supplier_id: itemOrSuggestion.preferred_supplier?.id || '',
      });
    }
    setOrderDialogOpen(true);
  };
