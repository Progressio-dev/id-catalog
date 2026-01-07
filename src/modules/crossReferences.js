/**
 * Cross-References Module
 * Product linking and cross-referencing system
 */

import { Logger } from './utils.js';

const logger = new Logger('CrossReferences');

/**
 * Cross-Reference Types
 */
export const ReferenceTypes = {
    RELATED: 'related',
    VARIANT: 'variant',
    SEE_ALSO: 'see_also',
    REPLACED_BY: 'replaced_by',
    SUPERSEDED_BY: 'superseded_by',
    ACCESSORY: 'accessory',
    COMPATIBLE: 'compatible',
    SERIES: 'series',
    COLLECTION: 'collection'
};

/**
 * Cross-Reference Engine Class
 */
export default class CrossReferenceEngine {
    constructor() {
        this.references = new Map(); // sourceId -> array of references
        this.reverseIndex = new Map(); // targetId -> array of sources
    }

    /**
     * Add a cross-reference
     * @param {string} sourceId - Source record ID
     * @param {string} targetId - Target record ID
     * @param {string} type - Reference type
     * @param {object} metadata - Additional metadata
     */
    addReference(sourceId, targetId, type = ReferenceTypes.RELATED, metadata = {}) {
        try {
            const reference = {
                sourceId,
                targetId,
                type,
                metadata,
                createdAt: new Date().toISOString()
            };

            // Add to forward index
            if (!this.references.has(sourceId)) {
                this.references.set(sourceId, []);
            }
            this.references.get(sourceId).push(reference);

            // Add to reverse index for bidirectional lookup
            if (!this.reverseIndex.has(targetId)) {
                this.reverseIndex.set(targetId, []);
            }
            this.reverseIndex.get(targetId).push(reference);

            logger.info(`Reference added: ${sourceId} -> ${targetId} (${type})`);
            return reference;
        } catch (error) {
            logger.error(`Failed to add reference: ${error.message}`);
            throw error;
        }
    }

    /**
     * Remove a cross-reference
     */
    removeReference(sourceId, targetId, type = null) {
        let removed = false;

        // Remove from forward index
        if (this.references.has(sourceId)) {
            const refs = this.references.get(sourceId);
            const filtered = refs.filter(ref => {
                const match = ref.targetId !== targetId || (type && ref.type !== type);
                if (!match) removed = true;
                return match;
            });
            
            if (filtered.length === 0) {
                this.references.delete(sourceId);
            } else {
                this.references.set(sourceId, filtered);
            }
        }

        // Remove from reverse index
        if (this.reverseIndex.has(targetId)) {
            const refs = this.reverseIndex.get(targetId);
            const filtered = refs.filter(ref => {
                return ref.sourceId !== sourceId || (type && ref.type !== type);
            });
            
            if (filtered.length === 0) {
                this.reverseIndex.delete(targetId);
            } else {
                this.reverseIndex.set(targetId, filtered);
            }
        }

        if (removed) {
            logger.info(`Reference removed: ${sourceId} -> ${targetId}`);
        }

        return removed;
    }

    /**
     * Get all references from a record
     */
    getReferences(recordId, type = null) {
        const refs = this.references.get(recordId) || [];
        
        if (type) {
            return refs.filter(ref => ref.type === type);
        }
        
        return refs;
    }

    /**
     * Get all records that reference this record
     */
    getReferencedBy(recordId, type = null) {
        const refs = this.reverseIndex.get(recordId) || [];
        
        if (type) {
            return refs.filter(ref => ref.type === type);
        }
        
        return refs;
    }

    /**
     * Get bidirectional references
     */
    getBidirectionalReferences(recordId, type = null) {
        return {
            outgoing: this.getReferences(recordId, type),
            incoming: this.getReferencedBy(recordId, type)
        };
    }

    /**
     * Check if two records are linked
     */
    areLinked(recordId1, recordId2) {
        const refs1 = this.getReferences(recordId1);
        const refs2 = this.getReferences(recordId2);
        
        return refs1.some(ref => ref.targetId === recordId2) ||
               refs2.some(ref => ref.targetId === recordId1);
    }

    /**
     * Validate references against dataset
     * @param {array} records - Data records with ID field
     * @param {string} idField - Name of ID field
     */
    validateReferences(records, idField = 'id') {
        const validIds = new Set(records.map(r => r[idField]));
        const broken = [];

        this.references.forEach((refs, sourceId) => {
            if (!validIds.has(sourceId)) {
                broken.push({
                    type: 'source_not_found',
                    sourceId,
                    message: `Source record not found: ${sourceId}`
                });
            }

            refs.forEach(ref => {
                if (!validIds.has(ref.targetId)) {
                    broken.push({
                        type: 'target_not_found',
                        sourceId: ref.sourceId,
                        targetId: ref.targetId,
                        referenceType: ref.type,
                        message: `Target record not found: ${ref.targetId}`
                    });
                }
            });
        });

        if (broken.length > 0) {
            logger.warn(`Found ${broken.length} broken references`);
        } else {
            logger.info('All references are valid');
        }

        return broken;
    }

    /**
     * Resolve references to actual records
     * @param {string} recordId - Source record ID
     * @param {array} records - All data records
     * @param {string} idField - Name of ID field
     */
    resolveReferences(recordId, records, idField = 'id') {
        const refs = this.getReferences(recordId);
        const resolved = [];

        refs.forEach(ref => {
            const targetRecord = records.find(r => r[idField] === ref.targetId);
            if (targetRecord) {
                resolved.push({
                    type: ref.type,
                    metadata: ref.metadata,
                    record: targetRecord
                });
            }
        });

        return resolved;
    }

    /**
     * Build reference graph
     */
    buildGraph() {
        const graph = {
            nodes: new Set(),
            edges: []
        };

        this.references.forEach((refs, sourceId) => {
            graph.nodes.add(sourceId);
            
            refs.forEach(ref => {
                graph.nodes.add(ref.targetId);
                graph.edges.push({
                    from: sourceId,
                    to: ref.targetId,
                    type: ref.type
                });
            });
        });

        return {
            nodes: Array.from(graph.nodes),
            edges: graph.edges
        };
    }

    /**
     * Find reference chains (A -> B -> C)
     */
    findChains(startId, maxDepth = 3) {
        const chains = [];
        const visited = new Set();

        const traverse = (currentId, chain, depth) => {
            if (depth > maxDepth || visited.has(currentId)) {
                return;
            }

            visited.add(currentId);
            const refs = this.getReferences(currentId);

            if (refs.length === 0) {
                if (chain.length > 1) {
                    chains.push([...chain]);
                }
            } else {
                refs.forEach(ref => {
                    traverse(ref.targetId, [...chain, ref.targetId], depth + 1);
                });
            }

            visited.delete(currentId);
        };

        traverse(startId, [startId], 0);
        return chains;
    }

    /**
     * Group references by type
     */
    groupByType(recordId) {
        const refs = this.getReferences(recordId);
        const grouped = {};

        refs.forEach(ref => {
            if (!grouped[ref.type]) {
                grouped[ref.type] = [];
            }
            grouped[ref.type].push(ref);
        });

        return grouped;
    }

    /**
     * Import references from data field
     * @param {array} records - Data records
     * @param {string} idField - ID field name
     * @param {string} refField - Reference field name (comma-separated IDs)
     * @param {string} type - Reference type
     */
    importFromField(records, idField = 'id', refField = 'related_products', type = ReferenceTypes.RELATED) {
        let count = 0;

        records.forEach(record => {
            const sourceId = record[idField];
            const refValue = record[refField];

            if (refValue) {
                const targetIds = String(refValue).split(',').map(id => id.trim());
                
                targetIds.forEach(targetId => {
                    if (targetId) {
                        this.addReference(sourceId, targetId, type);
                        count++;
                    }
                });
            }
        });

        logger.info(`Imported ${count} references from field ${refField}`);
        return count;
    }

    /**
     * Export references to data structure
     */
    exportToData(records, idField = 'id') {
        const enriched = records.map(record => {
            const recordId = record[idField];
            const refs = this.getReferences(recordId);
            
            return {
                ...record,
                _references: refs.map(ref => ({
                    id: ref.targetId,
                    type: ref.type
                })),
                _referencedBy: this.getReferencedBy(recordId).map(ref => ({
                    id: ref.sourceId,
                    type: ref.type
                }))
            };
        });

        return enriched;
    }

    /**
     * Clear all references
     */
    clearAll() {
        this.references.clear();
        this.reverseIndex.clear();
        logger.info('All references cleared');
    }

    /**
     * Get statistics
     */
    getStatistics() {
        let totalRefs = 0;
        const typeCount = {};

        this.references.forEach(refs => {
            totalRefs += refs.length;
            refs.forEach(ref => {
                typeCount[ref.type] = (typeCount[ref.type] || 0) + 1;
            });
        });

        return {
            totalRecordsWithReferences: this.references.size,
            totalReferences: totalRefs,
            averageReferencesPerRecord: this.references.size > 0 ? 
                (totalRefs / this.references.size).toFixed(2) : 0,
            referencesByType: typeCount
        };
    }

    /**
     * Save references to storage
     */
    save() {
        try {
            const data = {
                references: Array.from(this.references.entries()),
                reverseIndex: Array.from(this.reverseIndex.entries())
            };
            
            localStorage.setItem('catalogBuilderReferences', JSON.stringify(data));
            logger.info('Cross-references saved');
        } catch (error) {
            logger.error('Failed to save references:', error);
            throw error;
        }
    }

    /**
     * Load references from storage
     */
    load() {
        try {
            const saved = localStorage.getItem('catalogBuilderReferences');
            if (saved) {
                const data = JSON.parse(saved);
                this.references = new Map(data.references);
                this.reverseIndex = new Map(data.reverseIndex);
                logger.info('Cross-references loaded');
            }
        } catch (error) {
            logger.error('Failed to load references:', error);
        }
    }

    /**
     * Export to JSON
     */
    exportToJSON() {
        return {
            version: '1.0',
            references: Array.from(this.references.entries()).map(([sourceId, refs]) => ({
                sourceId,
                references: refs
            })),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import from JSON
     */
    importFromJSON(data) {
        try {
            this.clearAll();
            
            if (data.references && Array.isArray(data.references)) {
                data.references.forEach(item => {
                    item.references.forEach(ref => {
                        this.addReference(ref.sourceId, ref.targetId, ref.type, ref.metadata);
                    });
                });
            }
            
            logger.info('Cross-references imported from JSON');
        } catch (error) {
            logger.error('Failed to import references:', error);
            throw error;
        }
    }
}
