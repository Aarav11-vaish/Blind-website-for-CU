// Simple API cache replacement

export const apiCache = {
  getStats() {
    return {
      totalEntries: 0,
      validEntries: 0,
      hitRate: 0,
      expiredEntries: 0
    };
  },
  
  clear() {
    // Simple implementation - do nothing
  }
};