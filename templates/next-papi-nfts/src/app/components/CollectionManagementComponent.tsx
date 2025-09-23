'use client';

import React, { useState, useEffect } from 'react';
import { CollectionConfig, CollectionTeam, useCollectionManagement, useCollectionMetadata, useCollectionRoles } from '../hooks/collections';
import { usePolkadot } from '../contexts/PolkadotContext';

interface CollectionInfo {
  id: string;
  collection: any;
  metadata: any;
  attributes: any[];
  owner: string;
  roles: any[];
}

export const CollectionManagementComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'info' | 'roles'>('create');
  const [searchCollectionId, setSearchCollectionId] = useState<string>('');
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo | null>(null);

  // Add Polkadot context for direct API access
  const { api, isConnected } = usePolkadot();

  // UI notification states
  const [notifications, setNotifications] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
    show: boolean;
  }>({
    type: null,
    message: '',
    show: false
  });

  // Show notification
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotifications({ type, message, show: true });
    // Auto hide after 5 seconds
    setTimeout(() => {
      setNotifications(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Clear notification
  const clearNotification = () => {
    setNotifications({ type: null, message: '', show: false });
  };

  // Helper function to format BigInt values
  const formatBigInt = (value: bigint | string | number | undefined, decimals = 12): string => {
    if (!value) return '0';
    const bigintValue = typeof value === 'bigint' ? value : BigInt(value);
    const divisor = BigInt(10 ** decimals);
    const quotient = bigintValue / divisor;
    const remainder = bigintValue % divisor;
    
    if (remainder === 0n) {
      return quotient.toString();
    } else {
      const remainderStr = remainder.toString().padStart(decimals, '0').replace(/0+$/, '');
      return `${quotient}.${remainderStr}`;
    }
  };

  // Helper function to safely render attribute values
  const safeRenderValue = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'bigint') return value.toString();
    if (value?.asText && typeof value.asText === 'function') {
      try {
        return value.asText();
      } catch (error) {
        return '[Error reading text]';
      }
    }
    if (value?.asHex && typeof value.asHex === 'function') {
      try {
        return value.asHex();
      } catch (error) {
        return '[Error reading hex]';
      }
    }
    if (value === null || value === undefined) return '';
    
    try {
      return JSON.stringify(value, (key, val) => 
        typeof val === 'bigint' ? val.toString() : val
      );
    } catch (error) {
      return '[Complex object]';
    }
  };

  // Helper function to process raw attribute entries from Polkadot API
  const processAttributeEntries = (rawEntries: any[]) => {
    console.log('Raw attribute entries:', rawEntries);
    
    return rawEntries
      .filter(entry => {
        // Filter only CollectionOwner namespace attributes (user-set attributes)
        const namespace = entry.keyArgs?.[2];
        console.log('Attribute namespace:', namespace);
        return namespace?.type === 'CollectionOwner' || namespace?.CollectionOwner !== undefined;
      })
      .map(entry => {
        let key = 'Unknown Key';
        let value = 'Unknown Value';
        
        try {
          const rawKey = entry.keyArgs?.[3];
          if (rawKey?.asText) {
            key = rawKey.asText();
          } else if (typeof rawKey === 'string') {
            key = rawKey;
          } else {
            key = safeRenderValue(rawKey);
          }
          
          // Extract value - FIX THE VALUE EXTRACTION
          const rawValue = entry.value;
          
          // The value is an array: [Binary, {account, amount}]
          // The actual text value is in the Binary object at index [0]
          if (Array.isArray(rawValue) && rawValue.length >= 1) {
            const binaryValue = rawValue[0]; // Get the Binary object
            console.log(`Binary value object:`, binaryValue);
            
            if (binaryValue && typeof binaryValue === 'object' && binaryValue.asText) {
              try {
                value = binaryValue.asText();
                console.log(`Extracted text value: "${value}"`);
              } catch (e) {
                console.log('Failed to extract text from Binary:', e);
                value = `[Binary extraction failed]`;
              }
            } else {
              console.log('Binary object does not have asText method');
              value = `[No asText method]`;
            }
          } else if (rawValue && typeof rawValue === 'object') {
            // Fallback for non-array values
            if (rawValue.asText && typeof rawValue.asText === 'function') {
              try {
                value = rawValue.asText();
                console.log(`Extracted via direct asText(): "${value}"`);
              } catch (e) {
                console.log('Direct asText() failed:', e);
                value = `[Direct asText failed]`;
              }
            } else {
              console.log('Value object structure:', Object.keys(rawValue));
              value = `[Complex object: ${typeof rawValue}]`;
            }
          } else if (typeof rawValue === 'string') {
            value = rawValue;
            console.log(`Direct string value: "${value}"`);
          } else {
            value = `[Unknown type: ${typeof rawValue}]`;
          }
          
        } catch (error) {
          console.warn('Error processing attribute entry:', error);
        }
        
        console.log(`Final processed attribute: ${key} = ${value}`);
        return { key, value };
      });
  };

  // Hook instances
  const {
    createCollection,
    getCollection,
    getNextCollectionId,
    states: managementStates,
    isReady: managementReady
  } = useCollectionManagement();

  const {
    getCollectionInfo,
    setCollectionMetadata,
    setCollectionAttribute,
    setCollectionAttributes,
    states: metadataStates,
    isReady: metadataReady
  } = useCollectionMetadata();

  const {
    setCollectionTeam,
    getCollectionRoles,
    getCollectionTeamMembers,
    getCollectionOwner,
    states: rolesStates,
    isReady: rolesReady
  } = useCollectionRoles();

  // Form states
  const [createForm, setCreateForm] = useState<CollectionConfig>({
    maxSupply: undefined,
    transferable: true,
    publicMinting: false,
    mintPrice: undefined,
    defaultItemSettings: undefined
  });

  const [mintPriceInput, setMintPriceInput] = useState<string>('');

  const [metadataForm, setMetadataForm] = useState({
    url: '',
    attributes: [{ key: '', value: '' }]
  });

  const [attributesForm, setAttributesForm] = useState({
    attributes: [{ key: '', value: '' }]
  });

  const [rolesForm, setRolesForm] = useState<CollectionTeam>({
    admin: '',
    issuer: '',
    freezer: ''
  });

  const [nextCollectionId, setNextCollectionId] = useState<string | null>(null);

  // Direct API call to get next collection ID
  const fetchNextCollectionId = async () => {
    try {
      const nextId = await getNextCollectionId();
      setNextCollectionId(nextId.toString());
    } catch (error) {
      console.error('Failed to fetch next collection ID:', error);
      setNextCollectionId('Error loading ID');
    }
  };

  // Fetch next collection ID on component mount and when API becomes ready
  useEffect(() => {
    fetchNextCollectionId();
  }, [api, isConnected]);

  // Handle collection search/info loading
  const handleLoadCollectionInfo = async () => {
    if (!searchCollectionId.trim()) {
      showNotification('error', 'Please enter a collection ID');
      return;
    }

    // Validate that the collection ID is a valid number
    const collectionIdNum = parseInt(searchCollectionId.trim(), 10);
    if (isNaN(collectionIdNum) || collectionIdNum < 0) {
      showNotification('error', 'Please enter a valid collection ID (non-negative number)');
      return;
    }

    try {
      clearNotification();

      const collection = await getCollection(collectionIdNum);

      if (!collection) {
        showNotification('error', 'Collection not found or does not exist');
        return;
      }

      const info = await getCollectionInfo(collectionIdNum);

      const owner = await getCollectionOwner(collectionIdNum);

      const teamMembers = await getCollectionTeamMembers(collectionIdNum);

      const processedAttributes = info.attributes ? processAttributeEntries(info.attributes) : [];
      
      setCollectionInfo({
        id: searchCollectionId.trim(),
        collection,
        metadata: info.metadata,
        attributes: processedAttributes,
        owner: owner || 'Unknown',
        roles: teamMembers
      });

      showNotification('success', `Collection #${searchCollectionId} loaded successfully`);
    } catch (error: any) {
      console.error('Failed to load collection info:', error);
      showNotification('error', `Failed to load collection information: ${error?.message || 'Unknown error'}`);
    }
  };

  // Handle collection creation
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!managementReady) {
      showNotification('error', 'Please connect your wallet first');
      return;
    }

    try {
      clearNotification();

      let mintPrice: bigint | undefined = undefined;
      if (mintPriceInput.trim()) {
        try {
          const priceFloat = parseFloat(mintPriceInput);
          mintPrice = BigInt(Math.floor(priceFloat * Math.pow(10, 12)));
        } catch (error) {
          showNotification('error', 'Invalid mint price format');
          return;
        }
      }

      const config: CollectionConfig = {
        maxSupply: createForm.maxSupply,
        transferable: createForm.transferable,
        publicMinting: createForm.publicMinting,
        mintPrice: mintPrice,
        defaultItemSettings: createForm.defaultItemSettings,
        startBlock: createForm.startBlock,
        endBlock: createForm.endBlock,
      };

      console.log('Creating collection with config:', config);
      
      const result = await createCollection(config);

      // Reset form
      setCreateForm({
        maxSupply: undefined,
        transferable: true,
        publicMinting: false,
        mintPrice: undefined,
        defaultItemSettings: undefined
      });
      setMintPriceInput('');
      
      await fetchNextCollectionId();
      
      showNotification('success', `Collection created successfully! Transaction: ${result.transactionHash}`);
    } catch (error: any) {
      console.error('Failed to create collection:', error);
      showNotification('error', `Failed to create collection: ${error?.message || 'Unknown error'}`);
    }
  };

  // Handle metadata update (using batch attributes now)
  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!collectionInfo || !metadataForm.url.trim()) {
      showNotification('error', 'Please enter a metadata URL');
      return;
    }

    // Validate URL
    try {
      new URL(metadataForm.url.trim());
    } catch {
      showNotification('error', 'Please enter a valid URL');
      return;
    }

    try {
      clearNotification();
      
      const collectionIdNum = parseInt(collectionInfo.id, 10);
      await setCollectionMetadata(collectionIdNum, metadataForm.url.trim());
      
      // Set attributes if any - USING BATCH FUNCTION
      const validAttributes = metadataForm.attributes.filter(attr => 
        attr.key.trim() && attr.value.trim()
      );
      
      if (validAttributes.length > 0) {
        await setCollectionAttributes(collectionIdNum, validAttributes.map(attr => ({
          key: attr.key.trim(),
          value: attr.value.trim()
        })));
      }
      
      const successMessage = `Metadata updated successfully!${validAttributes.length > 0 ? ` Added ${validAttributes.length} attributes.` : ''}`;
      showNotification('success', successMessage);
      
      // Refresh collection info
      await handleLoadCollectionInfo();
      
      // Reset metadata form
      setMetadataForm({
        url: '',
        attributes: [{ key: '', value: '' }]
      });
    } catch (error: any) {
      console.error('Failed to update metadata:', error);
      showNotification('error', `Failed to update metadata: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleSetAttributes = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!collectionInfo) {
      showNotification('error', 'Please load a collection first');
      return;
    }

    const validAttributes = attributesForm.attributes.filter(attr => 
      attr.key.trim() && attr.value.trim()
    );

    if (validAttributes.length === 0) {
      showNotification('error', 'Please add at least one attribute with both key and value');
      return;
    }

    try {
      clearNotification();
      
      const collectionIdNum = parseInt(collectionInfo.id, 10);

      console.log('Setting attributes:', validAttributes);
      console.log('Collection ID:', collectionIdNum);
      
      const result = await setCollectionAttributes(collectionIdNum, validAttributes.map(attr => ({
        key: attr.key.trim(),
        value: attr.value.trim()
      })));
      
      console.log('Set attributes result:', result);
      
      showNotification('success', `Successfully added ${validAttributes.length} attributes!`);

      setTimeout(async () => {
        console.log('Refreshing collection info after setting attributes...');
        await handleLoadCollectionInfo();
      }, 2000);
      
      // Reset attributes form
      setAttributesForm({
        attributes: [{ key: '', value: '' }]
      });
    } catch (error: any) {
      console.error('Failed to set attributes:', error);
      showNotification('error', `Failed to set attributes: ${error?.message || 'Unknown error'}`);
    }
  };

  // Helper function to validate Polkadot address
  const isValidPolkadotAddress = (address: string): boolean => {
    if (!address || address.length < 47 || address.length > 48) return false;
    return /^[1-9A-HJ-NP-Za-km-z]+$/.test(address);
  };

  // Handle roles update
  const handleUpdateRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!collectionInfo) return;

    // Validate addresses
    const addresses = [rolesForm.admin, rolesForm.issuer, rolesForm.freezer].filter(addr => addr?.trim());
    for (const addr of addresses) {
      if (addr && !isValidPolkadotAddress(addr.trim())) {
        showNotification('error', `Invalid Polkadot address: ${addr}`);
        return;
      }
    }

    try {
      clearNotification();
      
      const team: CollectionTeam = {};
      if (rolesForm.admin?.trim()) team.admin = rolesForm.admin.trim();
      if (rolesForm.issuer?.trim()) team.issuer = rolesForm.issuer.trim();
      if (rolesForm.freezer?.trim()) team.freezer = rolesForm.freezer.trim();
      
      const collectionIdNum = parseInt(collectionInfo.id, 10);
      await setCollectionTeam(collectionIdNum, team);
      
      showNotification('success', 'Roles updated successfully!');
      
      // Refresh collection info
      await handleLoadCollectionInfo();
    } catch (error: any) {
      console.error('Failed to update roles:', error);
      showNotification('error', `Failed to update roles: ${error?.message || 'Unknown error'}`);
    }
  };

  // Updated loading states - using proper hook states
  const isCreatingCollection = managementStates.createCollection.isLoading;
  const isGettingCollection = managementStates.getCollection.isLoading;
  const isUpdatingMetadata = metadataStates.setMetadata.isLoading;
  const isSettingAttributes = metadataStates.setAttributes.isLoading;
  const isGettingInfo = metadataStates.getInfo.isLoading;
  const isGettingOwner = rolesStates.getOwner?.isLoading || false;
  const isGettingTeamMembers = rolesStates.getTeamMembers?.isLoading || false;
  const isSettingRoles = rolesStates.setTeam?.isLoading || false;

  // Combined loading states
  const managementLoading = Object.values(managementStates).some(state => state.isLoading);
  const metadataLoading = Object.values(metadataStates).some(state => state.isLoading);
  const rolesLoading = Object.values(rolesStates || {}).some(state => state.isLoading);
  
  // Combined error states
  const managementError = Object.values(managementStates).find(state => state.error)?.error;
  const metadataError = Object.values(metadataStates).find(state => state.error)?.error;
  const rolesError = Object.values(rolesStates || {}).find(state => state.error)?.error;

  // Overall states
  const isLoading = managementLoading || metadataLoading || rolesLoading;
  const isReady = managementReady && metadataReady && rolesReady;
  const error = managementError || metadataError || rolesError;

  // Is loading collection info (combination of multiple operations)
  const isLoadingCollectionInfo = isGettingCollection || isGettingInfo || isGettingOwner || isGettingTeamMembers;

  useEffect(() => {
    console.log(isLoading, 'IS_LOADING')
    console.log(isReady, 'IS_READY')
  }, [isLoading, isReady])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 p-6">Collection Management</h1>
          
          {/* Tab Navigation */}
          <nav className="flex px-6">
            {[
              { id: 'create', label: 'Create Collection', icon: '➕' },
              { id: 'info', label: 'Collection Info', icon: '📊' },
              { id: 'roles', label: 'Manage Roles', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Notification Toast */}
          {notifications.show && (
            <div className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg p-4 ${
              notifications.type === 'success' ? 'bg-green-50 border border-green-200' :
              notifications.type === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notifications.type === 'success' && (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {notifications.type === 'error' && (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {notifications.type === 'info' && (
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className={`text-sm font-medium ${
                    notifications.type === 'success' ? 'text-green-800' :
                    notifications.type === 'error' ? 'text-red-800' :
                    'text-blue-800'
                  }`}>
                    {notifications.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={clearNotification}
                    className={`rounded-md inline-flex ${
                      notifications.type === 'success' ? 'text-green-400 hover:text-green-600 focus:text-green-600' :
                      notifications.type === 'error' ? 'text-red-400 hover:text-red-600 focus:text-red-600' :
                      'text-blue-400 hover:text-blue-600 focus:text-blue-600'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notifications.type === 'success' ? 'focus:ring-green-500' :
                      notifications.type === 'error' ? 'focus:ring-red-500' :
                      'focus:ring-blue-500'
                    }`}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Connection Status */}
          {!isReady && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <p className="text-yellow-700">
                Please connect your wallet and ensure the Polkadot API is ready.
              </p>
            </div>
          )}

          {/* Error Display - Only show if no specific errors are being displayed */}
          {error && !metadataStates.setMetadata.error && !metadataStates.setAttributes.error && !metadataStates.setAttribute.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Specific Error Messages */}
          {metadataStates.setMetadata.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-700">Metadata Update Error: {metadataStates.setMetadata.error}</p>
            </div>
          )}

          {metadataStates.setAttributes.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-700">Batch Attributes Error: {metadataStates.setAttributes.error}</p>
            </div>
          )}

          {metadataStates.setAttribute.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-700">Single Attribute Error: {metadataStates.setAttribute.error}</p>
            </div>
          )}

          {/* Create Collection Tab */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-blue-700">
                  Next Collection ID: <strong>{nextCollectionId || 'Loading...'}</strong>
                </p>
                <button
                  onClick={fetchNextCollectionId}
                  disabled={!api || !isConnected}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Refresh ID
                </button>
              </div>

              <form onSubmit={handleCreateCollection} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Supply (optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={createForm.maxSupply || ''}
                      onChange={(e) => setCreateForm({
                        ...createForm,
                        maxSupply: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      className="input"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mint Price (optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.000000000001"
                      value={mintPriceInput}
                      onChange={(e) => setMintPriceInput(e.target.value)}
                      className="input"
                      placeholder="Price in tokens"
                    />
                    <p className="text-xs text-gray-500 mt-1">Price per NFT mint (in native tokens)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="transferable"
                      checked={createForm.transferable}
                      onChange={(e) => setCreateForm({
                        ...createForm,
                        transferable: e.target.checked
                      })}
                      className="rounded"
                    />
                    <label htmlFor="transferable" className="text-sm text-gray-700">
                      Items are transferable
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="publicMinting"
                      checked={createForm.publicMinting}
                      onChange={(e) => setCreateForm({
                        ...createForm,
                        publicMinting: e.target.checked
                      })}
                      className="rounded"
                    />
                    <label htmlFor="publicMinting" className="text-sm text-gray-700">
                      Allow public minting
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isReady || isCreatingCollection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                  {isCreatingCollection ? 'Creating Collection...' : 'Create Collection'}
                </button>
              </form>
            </div>
          )}

          {/* Collection Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={searchCollectionId}
                  onChange={(e) => setSearchCollectionId(e.target.value)}
                  placeholder="Enter Collection ID"
                  className="input flex-1"
                />
                <button
                  onClick={handleLoadCollectionInfo}
                  disabled={!isReady || isLoadingCollectionInfo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingCollectionInfo ? (
                    isGettingCollection ? 'Loading Collection...' :
                    isGettingInfo ? 'Loading Details...' :
                    isGettingOwner ? 'Loading Owner...' :
                    isGettingTeamMembers ? 'Loading Team...' :
                    'Loading...'
                  ) : 'Load Info'}
                </button>
              </div>

              {collectionInfo && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Collection ID:</span> {collectionInfo.id}
                      </div>
                      <div>
                        <span className="font-medium">Owner:</span>
                        <div className="font-mono text-sm break-all mt-1">
                          {collectionInfo.owner}
                        </div>
                      </div>
                      {collectionInfo.collection?.items && (
                        <div>
                          <span className="font-medium">Total Items:</span> {collectionInfo.collection.items.toString()}
                        </div>
                      )}
                      {collectionInfo.collection?.max_supply && (
                        <div>
                          <span className="font-medium">Max Supply:</span> {collectionInfo.collection.max_supply.toString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Metadata</h3>
                    {collectionInfo.metadata ? (
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium">URL:</span>
                          <div className="text-sm break-all mt-1">
                            {collectionInfo.metadata.data}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Deposit:</span> {formatBigInt(collectionInfo.metadata.deposit)} tokens
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No metadata set</p>
                    )}
                    
                    {/* Update Metadata Form */}
                    <form onSubmit={handleUpdateMetadata} className="mt-4 space-y-3">
                      <input
                        type="url"
                        value={metadataForm.url}
                        onChange={(e) => setMetadataForm({ ...metadataForm, url: e.target.value })}
                        placeholder="Metadata URL"
                        className="input"
                      />
                      <button
                        type="submit"
                        disabled={!isReady || isUpdatingMetadata || isSettingAttributes}
                        className="btn btn-secondary w-full text-sm"
                      >
                        {isUpdatingMetadata ? 'Updating Metadata...' : 
                         isSettingAttributes ? 'Setting Attributes...' : 
                         'Update Metadata'}
                      </button>
                    </form>
                  </div>

                  {/* Existing Attributes */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Current Attributes</h3>
                    {collectionInfo.attributes && collectionInfo.attributes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {collectionInfo.attributes.map((attr, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded border">
                            <div className="font-medium">{attr.key}</div>
                            <div className="text-sm text-gray-600">{attr.value}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No attributes set</p>
                    )}
                  </div>

                  {/* Standalone Add Attributes Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Add New Attributes</h3>
                    <form onSubmit={handleSetAttributes} className="space-y-4">
                      <div className="space-y-3">
                        {attributesForm.attributes.map((attr, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={attr.key}
                              onChange={(e) => {
                                const newAttrs = [...attributesForm.attributes];
                                newAttrs[index].key = e.target.value;
                                setAttributesForm({ attributes: newAttrs });
                              }}
                              placeholder="Enter attribute key"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={attr.value}
                              onChange={(e) => {
                                const newAttrs = [...attributesForm.attributes];
                                newAttrs[index].value = e.target.value;
                                setAttributesForm({ attributes: newAttrs });
                              }}
                              placeholder="Enter attribute value"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newAttrs = attributesForm.attributes.filter((_, i) => i !== index);
                                if (newAttrs.length === 0) {
                                  newAttrs.push({ key: '', value: '' });
                                }
                                setAttributesForm({ attributes: newAttrs });
                              }}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                        <button
                          type="button"
                          onClick={() => {
                            setAttributesForm({
                              attributes: [...attributesForm.attributes, { key: '', value: '' }]
                            });
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none"
                        >
                          + Add Attribute
                        </button>
                        
                        <button
                          type="submit"
                          disabled={!isReady || isSettingAttributes}
                          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSettingAttributes ? 'Adding Attributes...' : 'Set Attributes'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Team Roles */}
                  <div className="card lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Team Roles</h3>
                    {collectionInfo.roles.length > 0 ? (
                      <div className="space-y-3">
                        {collectionInfo.roles.map((member, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <div className="font-mono text-sm break-all mb-2">
                              {member.address}
                            </div>
                            <div className="flex space-x-3 text-sm">
                              {member.isAdmin && <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Admin</span>}
                              {member.isIssuer && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Issuer</span>}
                              {member.isFreezer && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Freezer</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No roles assigned</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Roles Management Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              {!collectionInfo ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Please load a collection first using the "Collection Info" tab</p>
                </div>
              ) : (
                <form onSubmit={handleUpdateRoles} className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Set Roles for Collection #{collectionInfo.id}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Address
                      </label>
                      <input
                        type="text"
                        value={rolesForm.admin || ''}
                        onChange={(e) => setRolesForm({ ...rolesForm, admin: e.target.value })}
                        placeholder="Admin wallet address"
                        className="input"
                      />
                      <p className="text-xs text-gray-500 mt-1">Can manage collection settings and destroy collection</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issuer Address
                      </label>
                      <input
                        type="text"
                        value={rolesForm.issuer || ''}
                        onChange={(e) => setRolesForm({ ...rolesForm, issuer: e.target.value })}
                        placeholder="Issuer wallet address"
                        className="input"
                      />
                      <p className="text-xs text-gray-500 mt-1">Can mint new NFTs in this collection</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Freezer Address
                      </label>
                      <input
                        type="text"
                        value={rolesForm.freezer || ''}
                        onChange={(e) => setRolesForm({ ...rolesForm, freezer: e.target.value })}
                        placeholder="Freezer wallet address"
                        className="input"
                      />
                      <p className="text-xs text-gray-500 mt-1">Can freeze and unfreeze NFTs</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!isReady || rolesLoading}
                    className="btn btn-primary w-full"
                  >
                    {rolesLoading ? 'Updating Roles...' : 'Update Roles'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};