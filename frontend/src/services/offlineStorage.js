const OFFLINE_KEY = 'exam_offline_data';

export const offlineStorage = {
    // Save attendance when offline
    saveAttendance: (examId, studentId, status) => {
        const data = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '{}');

        if (!data.attendance) {
            data.attendance = {};
        }
        if (!data.attendance[examId]) {
            data.attendance[examId] = [];
        }

        // Add or update attendance record
        const existing = data.attendance[examId].findIndex(
            a => a.studentId === studentId
        );

        const record = {
            studentId,
            status,
            timestamp: Date.now(),
            synced: false
        };

        if (existing >= 0) {
            data.attendance[examId][existing] = record;
        } else {
            data.attendance[examId].push(record);
        }

        localStorage.setItem(OFFLINE_KEY, JSON.stringify(data));
        console.log('📦 Saved offline:', record);
    },

    // Save incident when offline
    saveIncident: (examId, incident) => {
        const data = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '{}');

        if (!data.incidents) {
            data.incidents = [];
        }

        data.incidents.push({
            ...incident,
            examId,
            timestamp: Date.now(),
            synced: false
        });

        localStorage.setItem(OFFLINE_KEY, JSON.stringify(data));
        console.log('📦 Incident saved offline');
    },

    // Get offline data
    getOfflineData: () => {
        return JSON.parse(localStorage.getItem(OFFLINE_KEY) || '{}');
    },

    // Check if there's unsynced data
    hasUnsyncedData: () => {
        const data = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '{}');
        const hasAttendance = data.attendance && Object.keys(data.attendance).length > 0;
        const hasIncidents = data.incidents && data.incidents.length > 0;
        return hasAttendance || hasIncidents;
    },

    // Clear synced data
    clearSyncedData: () => {
        localStorage.removeItem(OFFLINE_KEY);
        console.log('✅ Offline data cleared');
    },

    // Sync when back online (placeholder)
    syncWhenOnline: async () => {
        const data = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '{}');

        if (Object.keys(data).length === 0) {
            console.log('No offline data to sync');
            return;
        }

        console.log('🔄 Syncing offline data...', data);
        // TODO: Send to backend API
        // For now, just clear after "syncing"
        setTimeout(() => {
            offlineStorage.clearSyncedData();
            console.log('✅ Sync complete');
        }, 2000);
    }
};