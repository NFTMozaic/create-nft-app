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

  // Hook instances
  const {
    createCollection,
    getCollection,
    getNextCollectionId,
    isLoading: managementLoading,
    error: managementError,
    isReady: managementReady
  } = useCollectionManagement();

  const {
    getCollectionInfo,
    setCollectionMetadata,
    setCollectionAttribute,
    isLoading: metadataLoading,
    error: metadataError,
    isReady: metadataReady
  } = useCollectionMetadata();

  const {
    setCollectionTeam,
    getCollectionRoles,
    getCollectionTeamMembers,
    getCollectionOwner,
    isLoading: rolesLoading,
    error: rolesError,
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

  const [rolesForm, setRolesForm] = useState<CollectionTeam>({
    admin: '',
    issuer: '',
    freezer: ''
  });

  const [nextCollectionId, setNextCollectionId] = useState<string | null>(null);

  // Direct API call to get next collection ID
  const fetchNextCollectionId = async () => {
    if (!api || !isConnected) return;

    try {
      const nextId = await api.query.Nfts.NextCollectionId.getValue();
      if (!nextId) {
        throw new Error('Failed to get next collection ID');
      }
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
      alert('Please enter a collection ID');
      return;
    }

    // Validate that the collection ID is a valid number
    const collectionIdNum = parseInt(searchCollectionId.trim(), 10);
    if (isNaN(collectionIdNum) || collectionIdNum < 0) {
      alert('Please enter a valid collection ID (non-negative number)');
      return;
    }

    try {
      const [collection, info, owner, teamMembers] = await Promise.all([
        getCollection(+searchCollectionId),
        getCollectionInfo(collectionIdNum),
        getCollectionOwner(collectionIdNum),
        getCollectionTeamMembers(collectionIdNum)
      ]);

      if (!collection) {
        alert('Collection not found or does not exist');
        return;
      }

      setCollectionInfo({
        id: searchCollectionId.trim(),
        collection,
        metadata: info.metadata,
        attributes: info.attributes,
        owner: owner || 'Unknown',
        roles: teamMembers
      });
    } catch (error: any) {
      console.error('Failed to load collection info:', error);
      alert(`Failed to load collection information: ${error?.message || 'Unknown error'}`);
    }
  };

  // Handle collection creation
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!managementReady) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const config: CollectionConfig = {
        maxSupply: 1000,
        transferable: true,
        publicMinting: false,
        mintPrice: 2n,
        defaultItemSettings: 1n,
        // startBlock: createForm.startBlock,
        // endBlock: createForm.endBlock
      };

      console.log(config);

      
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

    } catch (error: any) {
      console.error('Failed to create collection:', error);
      alert(`Failed to create collection: ${error?.message || 'Unknown error'}`);
    }
  };

  // Handle metadata update
  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!collectionInfo || !metadataForm.url.trim()) {
      alert('Please enter a metadata URL');
      return;
    }

    // Validate URL
    try {
      new URL(metadataForm.url.trim());
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    try {
      const collectionIdNum = parseInt(collectionInfo.id, 10);
      await setCollectionMetadata(collectionIdNum, metadataForm.url.trim());
      
      // Set attributes if any
      const validAttributes = metadataForm.attributes.filter(attr => 
        attr.key.trim() && attr.value.trim()
      );
      
      for (const attr of validAttributes) {
        await setCollectionAttribute(collectionIdNum, attr.key.trim(), attr.value.trim());
      }
      
      alert(`Metadata updated successfully!${validAttributes.length > 0 ? ` Added ${validAttributes.length} attributes.` : ''}`);
      // Refresh collection info
      await handleLoadCollectionInfo();
      
      // Reset metadata form
      setMetadataForm({
        url: '',
        attributes: [{ key: '', value: '' }]
      });
    } catch (error: any) {
      console.error('Failed to update metadata:', error);
      alert(`Failed to update metadata: ${error?.message || 'Unknown error'}`);
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
        alert(`Invalid Polkadot address: ${addr}`);
        return;
      }
    }

    try {
      const team: CollectionTeam = {};
      if (rolesForm.admin?.trim()) team.admin = rolesForm.admin.trim();
      if (rolesForm.issuer?.trim()) team.issuer = rolesForm.issuer.trim();
      if (rolesForm.freezer?.trim()) team.freezer = rolesForm.freezer.trim();
      
      const collectionIdNum = parseInt(collectionInfo.id, 10);
      await setCollectionTeam(collectionIdNum, team);
      alert('Roles updated successfully!');
      
      // Refresh collection info
      await handleLoadCollectionInfo();
    } catch (error: any) {
      console.error('Failed to update roles:', error);
      alert(`Failed to update roles: ${error?.message || 'Unknown error'}`);
    }
  };

  const isLoading = managementLoading || metadataLoading || rolesLoading;
  const isReady = managementReady && metadataReady && rolesReady;
  const error = managementError || metadataError || rolesError;


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
          {/* Connection Status */}
          {!isReady && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <p className="text-yellow-700">
                Please connect your wallet and ensure the Polkadot API is ready.
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-700">{error}</p>
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
                  disabled={!isReady || isLoading}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? 'Creating Collection...' : 'Create Collection'}
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
                  disabled={!isReady || isLoading}
                  className="btn btn-primary"
                >
                  Load Info
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
                        disabled={!isReady || isLoading}
                        className="btn btn-secondary w-full text-sm"
                      >
                        Update Metadata
                      </button>
                    </form>
                  </div>

                  {/* Attributes */}
                  <div className="card lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Attributes</h3>
                    {collectionInfo.attributes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {collectionInfo.attributes.map((attr, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <div className="font-medium">{attr.key}</div>
                            <div className="text-sm text-gray-600">{attr.value}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No attributes set</p>
                    )}

                    {/* Add Attributes */}
                    <div className="mt-4 space-y-3">
                      {metadataForm.attributes.map((attr, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="text"
                            value={attr.key}
                            onChange={(e) => {
                              const newAttrs = [...metadataForm.attributes];
                              newAttrs[index].key = e.target.value;
                              setMetadataForm({ ...metadataForm, attributes: newAttrs });
                            }}
                            placeholder="Attribute key"
                            className="input flex-1"
                          />
                          <input
                            type="text"
                            value={attr.value}
                            onChange={(e) => {
                              const newAttrs = [...metadataForm.attributes];
                              newAttrs[index].value = e.target.value;
                              setMetadataForm({ ...metadataForm, attributes: newAttrs });
                            }}
                            placeholder="Attribute value"
                            className="input flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newAttrs = metadataForm.attributes.filter((_, i) => i !== index);
                              setMetadataForm({ ...metadataForm, attributes: newAttrs });
                            }}
                            className="btn btn-secondary px-3"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setMetadataForm({
                            ...metadataForm,
                            attributes: [...metadataForm.attributes, { key: '', value: '' }]
                          });
                        }}
                        className="btn btn-secondary text-sm"
                      >
                        Add Attribute
                      </button>
                    </div>
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
                    disabled={!isReady || isLoading}
                    className="btn btn-primary w-full"
                  >
                    {isLoading ? 'Updating Roles...' : 'Update Roles'}
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