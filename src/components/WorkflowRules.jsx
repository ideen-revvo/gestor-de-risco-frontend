import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import WorkflowRuleModal from './WorkflowRuleModal';

const WorkflowRules = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = () => {
    // Handle save logic here
    setIsModalOpen(false);
  };

  return (
    <div className="h-full">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Regras de Workflow</h2>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex justify-end mb-6">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Nova Regra
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-3 p-4 border-b border-gray-200">
                <div className="font-medium text-sm text-gray-600">Nome</div>
                <div className="font-medium text-sm text-gray-600">Faixa de Pagamento</div>
                <div className="font-medium text-sm text-gray-600">Papéis</div>
              </div>

              <div className="divide-y divide-gray-200">
                <div className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-3 items-center">
                    <div className="text-sm">Aprovação até 100k</div>
                    <div className="text-sm">R$ 10,00 - R$ 2.000,00</div>
                    <div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Papel 3
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-3 items-center">
                    <div className="text-sm">Aprovação até 500k</div>
                    <div className="text-sm">R$ 2.001,00 - R$ 10.000,00</div>
                    <div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Papel 2
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-3 items-center">
                    <div className="text-sm">Aprovação acima de 500k</div>
                    <div className="text-sm">Acima de R$ 10.000,00</div>
                    <div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Papel 1
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <WorkflowRuleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default WorkflowRules;