// src/services/inventoryService.ts

export interface InventoryItem {
    id?: string;
    itemName: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate: string;
    notes?: string;
    image?: string;
  }
  
  const BASE_URL = 'https://smartpantry-bc4q.onrender.com/inventory';
  
  export const addItem = async (data: InventoryItem): Promise<InventoryItem> => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add item');
    return await response.json();
  };
  
  export const fetchItems = async (): Promise<InventoryItem[]> => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch items');
    return await response.json();
  };
  
  export const getItemByName = async (name: string): Promise<InventoryItem> => {
    const response = await fetch(`${BASE_URL}/${name}`);
    if (!response.ok) throw new Error('Item not found');
    return await response.json();
  };
  
  export const getItemById = async (id: string): Promise<InventoryItem> => {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Item not found');
    return await response.json();
  };
  
  export const updateItem = async (id: string, data: InventoryItem): Promise<InventoryItem> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update item');
    return await response.json();
  };
  
  export const deleteItem = async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete item');
    return await response.json();
  };
  