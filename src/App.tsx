import { useState } from "react";
import "./App.css";
import { CurrencyInput } from "./CurrencyInput";

interface SavingsAccount {
  id: string;
  name: string;
  amount: number;
  interestRate: number;
}

interface ISAAccount {
  id: string;
  name: string;
  amount: number;
  interestRate: number;
  type: "cash" | "stocks";
}

interface SavedScenario {
  id: string;
  name: string;
  taxBand: TaxBand;
  accounts: SavingsAccount[];
  isaAccounts: ISAAccount[];
  savedAt: Date;
}

interface TaxCalculation {
  grossInterest: number;
  taxableInterest: number;
  taxOwed: number;
  netInterest: number;
  effectiveRate: number;
}

type TaxBand = "basic" | "higher" | "additional";

function App() {
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [isaAccounts, setIsaAccounts] = useState<ISAAccount[]>([]);
  const [taxBand, setTaxBand] = useState<TaxBand>("basic");
  const [newAccount, setNewAccount] = useState({
    name: "",
    amount: "",
    interestRate: "",
  });
  const [newISA, setNewISA] = useState({
    name: "",
    amount: "",
    interestRate: "",
    type: "cash" as "cash" | "stocks",
  });
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [scenarioName, setScenarioName] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  // UK Personal Savings Allowance (2024/25)
  const getSavingsAllowance = (band: TaxBand): number => {
    switch (band) {
      case "basic":
        return 1000;
      case "higher":
        return 500;
      case "additional":
        return 0;
    }
  };

  const getTaxRate = (band: TaxBand): number => {
    switch (band) {
      case "basic":
        return 0.2;
      case "higher":
        return 0.4;
      case "additional":
        return 0.45;
    }
  };

  const addAccount = () => {
    if (newAccount.name && newAccount.amount && newAccount.interestRate) {
      const account: SavingsAccount = {
        id: Date.now().toString(),
        name: newAccount.name,
        amount: parseFloat(newAccount.amount),
        interestRate: parseFloat(newAccount.interestRate),
      };
      setAccounts([...accounts, account]);
      setNewAccount({ name: "", amount: "", interestRate: "" });
    }
  };

  const removeAccount = (id: string) => {
    setAccounts(accounts.filter((account) => account.id !== id));
  };

  const addISA = () => {
    if (newISA.name && newISA.amount && newISA.interestRate) {
      const isa: ISAAccount = {
        id: Date.now().toString(),
        name: newISA.name,
        amount: parseFloat(newISA.amount),
        interestRate: parseFloat(newISA.interestRate),
        type: newISA.type,
      };
      setIsaAccounts([...isaAccounts, isa]);
      setNewISA({ name: "", amount: "", interestRate: "", type: "cash" });
    }
  };

  const removeISA = (id: string) => {
    setIsaAccounts(isaAccounts.filter((isa) => isa.id !== id));
  };

  const calculateISAInterest = (): number => {
    return isaAccounts.reduce((total, isa) => {
      return total + (isa.amount * isa.interestRate) / 100;
    }, 0);
  };

  const calculateTax = (): TaxCalculation => {
    const totalGrossInterest = accounts.reduce((total, account) => {
      return total + (account.amount * account.interestRate) / 100;
    }, 0);

    const savingsAllowance = getSavingsAllowance(taxBand);
    const taxRate = getTaxRate(taxBand);
    const taxableInterest = Math.max(0, totalGrossInterest - savingsAllowance);
    const taxOwed = taxableInterest * taxRate;
    const netInterest = totalGrossInterest - taxOwed;
    const effectiveRate =
      totalGrossInterest > 0 ? (taxOwed / totalGrossInterest) * 100 : 0;

    return {
      grossInterest: totalGrossInterest,
      taxableInterest,
      taxOwed,
      netInterest,
      effectiveRate,
    };
  };

  const calculateTaxForScenario = (scenario: SavedScenario): TaxCalculation => {
    const totalGrossInterest = scenario.accounts.reduce((total, account) => {
      return total + (account.amount * account.interestRate) / 100;
    }, 0);

    const savingsAllowance = getSavingsAllowance(scenario.taxBand);
    const taxRate = getTaxRate(scenario.taxBand);
    const taxableInterest = Math.max(0, totalGrossInterest - savingsAllowance);
    const taxOwed = taxableInterest * taxRate;
    const netInterest = totalGrossInterest - taxOwed;
    const effectiveRate =
      totalGrossInterest > 0 ? (taxOwed / totalGrossInterest) * 100 : 0;

    return {
      grossInterest: totalGrossInterest,
      taxableInterest,
      taxOwed,
      netInterest,
      effectiveRate,
    };
  };

  const calculateISAInterestForScenario = (scenario: SavedScenario): number => {
    return scenario.isaAccounts.reduce((total, isa) => {
      return total + (isa.amount * isa.interestRate) / 100;
    }, 0);
  };

  const saveScenario = () => {
    if (!scenarioName.trim()) return;

    const scenario: SavedScenario = {
      id: Date.now().toString(),
      name: scenarioName.trim(),
      taxBand,
      accounts: [...accounts],
      isaAccounts: [...isaAccounts],
      savedAt: new Date(),
    };

    setSavedScenarios([...savedScenarios, scenario]);
    setScenarioName("");
  };

  const loadScenario = (scenario: SavedScenario) => {
    setTaxBand(scenario.taxBand);
    setAccounts([...scenario.accounts]);
    setIsaAccounts([...scenario.isaAccounts]);
  };

  const deleteScenario = (id: string) => {
    setSavedScenarios(savedScenarios.filter((s) => s.id !== id));
    setSelectedScenarios(selectedScenarios.filter((s) => s !== id));
  };

  const toggleScenarioSelection = (id: string) => {
    if (selectedScenarios.includes(id)) {
      setSelectedScenarios(selectedScenarios.filter((s) => s !== id));
    } else if (selectedScenarios.length < 3) {
      setSelectedScenarios([...selectedScenarios, id]);
    }
  };

  const taxCalc = calculateTax();

  return (
    <div className="container">
      <h1>UK Savings Tax Calculator</h1>
      <p className="subtitle">
        Calculate your savings interest and tax liability with the Personal
        Savings Allowance
      </p>

      <div className="tax-band-selector">
        <h2>Tax Band</h2>
        <div className="tax-band-options">
          <label>
            <input
              type="radio"
              value="basic"
              checked={taxBand === "basic"}
              onChange={(e) => setTaxBand(e.target.value as TaxBand)}
            />
            Basic Rate (20%) - £1,000 allowance
          </label>
          <label>
            <input
              type="radio"
              value="higher"
              checked={taxBand === "higher"}
              onChange={(e) => setTaxBand(e.target.value as TaxBand)}
            />
            Higher Rate (40%) - £500 allowance
          </label>
          <label>
            <input
              type="radio"
              value="additional"
              checked={taxBand === "additional"}
              onChange={(e) => setTaxBand(e.target.value as TaxBand)}
            />
            Additional Rate (45%) - £0 allowance
          </label>
        </div>
      </div>

      <div className="add-account-form">
        <h2>Add Savings Account</h2>
        <div className="form-row">
          <input
            type="text"
            placeholder="Account name"
            value={newAccount.name}
            onChange={(e) =>
              setNewAccount({ ...newAccount, name: e.target.value })
            }
          />
          <CurrencyInput
            placeholder="Amount (£)"
            value={newAccount.amount}
            onChange={(value) =>
              setNewAccount({ ...newAccount, amount: value })
            }
          />
          <input
            type="number"
            step="0.01"
            placeholder="Interest rate (%)"
            value={newAccount.interestRate}
            onChange={(e) =>
              setNewAccount({ ...newAccount, interestRate: e.target.value })
            }
          />
          <button onClick={addAccount}>Add Account</button>
        </div>
      </div>

      <div className="accounts-list">
        <h2>Your Savings Accounts</h2>
        {accounts.length === 0 ? (
          <p>No accounts added yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Amount</th>
                <th>Interest Rate</th>
                <th>Annual Interest</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const annualInterest =
                  (account.amount * account.interestRate) / 100;
                return (
                  <tr key={account.id}>
                    <td>{account.name}</td>
                    <td>£{account.amount.toLocaleString()}</td>
                    <td>{account.interestRate}%</td>
                    <td>
                      £
                      {annualInterest.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <button onClick={() => removeAccount(account.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="add-isa-form">
        <h2>Add ISA Account</h2>
        <div className="form-row">
          <input
            type="text"
            placeholder="ISA name"
            value={newISA.name}
            onChange={(e) => setNewISA({ ...newISA, name: e.target.value })}
          />
          <CurrencyInput
            placeholder="Amount (£)"
            value={newISA.amount}
            onChange={(value) => setNewISA({ ...newISA, amount: value })}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Interest rate (%)"
            value={newISA.interestRate}
            onChange={(e) =>
              setNewISA({ ...newISA, interestRate: e.target.value })
            }
          />
          <select
            value={newISA.type}
            onChange={(e) =>
              setNewISA({
                ...newISA,
                type: e.target.value as "cash" | "stocks",
              })
            }
          >
            <option value="cash">Cash ISA</option>
            <option value="stocks">Stocks & Shares ISA</option>
          </select>
          <button onClick={addISA}>Add ISA</button>
        </div>
      </div>

      <div className="isa-list">
        <h2>Your ISA Accounts (Tax-Free)</h2>
        {isaAccounts.length === 0 ? (
          <p>No ISAs added yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ISA Name</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Interest Rate</th>
                <th>Annual Interest</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isaAccounts.map((isa) => {
                const annualInterest = (isa.amount * isa.interestRate) / 100;
                return (
                  <tr key={isa.id}>
                    <td>{isa.name}</td>
                    <td>
                      {isa.type === "cash" ? "Cash ISA" : "Stocks & Shares ISA"}
                    </td>
                    <td>£{isa.amount.toLocaleString()}</td>
                    <td>{isa.interestRate}%</td>
                    <td>
                      £
                      {annualInterest.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <button onClick={() => removeISA(isa.id)}>Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {(accounts.length > 0 || isaAccounts.length > 0) && (
        <div className="tax-summary">
          <h2>Complete Savings Summary</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Taxable Interest (Savings):</label>
              <span>
                £
                {taxCalc.grossInterest.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="summary-item">
              <label>Tax-Free Interest (ISAs):</label>
              <span>
                £
                {calculateISAInterest().toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="summary-item">
              <label>Personal Savings Allowance:</label>
              <span>
                £
                {getSavingsAllowance(taxBand).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="summary-item">
              <label>Taxable Interest:</label>
              <span>
                £
                {taxCalc.taxableInterest.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="summary-item">
              <label>
                Tax Owed ({(getTaxRate(taxBand) * 100).toFixed(0)}%):
              </label>
              <span>
                £
                {taxCalc.taxOwed.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="summary-item">
              <label>Net Taxable Interest:</label>
              <span>
                £
                {taxCalc.netInterest.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="summary-item total">
              <label>Total Net Interest (All Accounts):</label>
              <span>
                £
                {(taxCalc.netInterest + calculateISAInterest()).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}
              </span>
            </div>
            <div className="summary-item">
              <label>Overall Effective Tax Rate:</label>
              <span>
                {(
                  (taxCalc.taxOwed /
                    (taxCalc.grossInterest + calculateISAInterest())) *
                  100
                ).toFixed(2)}
                %
              </span>
            </div>
          </div>
        </div>
      )}

      {(accounts.length > 0 || isaAccounts.length > 0) && (
        <div className="save-scenario">
          <h2>Save Current Scenario</h2>
          <div className="save-form">
            <input
              type="text"
              placeholder="Scenario name (e.g., 'Current Setup', 'Max ISA Strategy')"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
            />
            <button onClick={saveScenario} disabled={!scenarioName.trim()}>
              Save Scenario
            </button>
          </div>
        </div>
      )}

      {savedScenarios.length > 0 && (
        <div className="saved-scenarios">
          <div className="scenarios-header">
            <h2>Saved Scenarios</h2>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="compare-toggle"
            >
              {showComparison ? "Hide Comparison" : "Compare Scenarios"}
            </button>
          </div>

          {!showComparison ? (
            <div className="scenarios-list">
              {savedScenarios.map((scenario) => {
                const scenarioTax = calculateTaxForScenario(scenario);
                const scenarioISAInterest =
                  calculateISAInterestForScenario(scenario);
                const totalNetInterest =
                  scenarioTax.netInterest + scenarioISAInterest;

                return (
                  <div key={scenario.id} className="scenario-card">
                    <div className="scenario-header">
                      <h3>{scenario.name}</h3>
                      <div className="scenario-actions">
                        <button onClick={() => loadScenario(scenario)}>
                          Load
                        </button>
                        <button
                          onClick={() => deleteScenario(scenario.id)}
                          className="delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="scenario-summary">
                      <div className="scenario-stat">
                        <label>Tax Band:</label>
                        <span>
                          {scenario.taxBand.charAt(0).toUpperCase() +
                            scenario.taxBand.slice(1)}{" "}
                          Rate
                        </span>
                      </div>
                      <div className="scenario-stat">
                        <label>Total Net Interest:</label>
                        <span>
                          £
                          {totalNetInterest.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="scenario-stat">
                        <label>Tax Owed:</label>
                        <span>
                          £
                          {scenarioTax.taxOwed.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="scenario-stat">
                        <label>Accounts:</label>
                        <span>
                          {scenario.accounts.length} Savings,{" "}
                          {scenario.isaAccounts.length} ISAs
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="comparison-view">
              <div className="comparison-selector">
                <h3>Select up to 3 scenarios to compare:</h3>
                <div className="scenario-checkboxes">
                  {savedScenarios.map((scenario) => (
                    <label key={scenario.id} className="scenario-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedScenarios.includes(scenario.id)}
                        onChange={() => toggleScenarioSelection(scenario.id)}
                        disabled={
                          !selectedScenarios.includes(scenario.id) &&
                          selectedScenarios.length >= 3
                        }
                      />
                      {scenario.name}
                    </label>
                  ))}
                </div>
              </div>

              {selectedScenarios.length > 0 && (
                <div className="comparison-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Metric</th>
                        {selectedScenarios.map((scenarioId) => {
                          const scenario = savedScenarios.find(
                            (s) => s.id === scenarioId
                          );
                          return <th key={scenarioId}>{scenario?.name}</th>;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>Tax Band</strong>
                        </td>
                        {selectedScenarios.map((scenarioId) => {
                          const scenario = savedScenarios.find(
                            (s) => s.id === scenarioId
                          );
                          return (
                            <td key={scenarioId}>
                              {scenario?.taxBand.charAt(0).toUpperCase() +
                                scenario?.taxBand.slice(1)}{" "}
                              Rate
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td>
                          <strong>Taxable Interest</strong>
                        </td>
                        {selectedScenarios.map((scenarioId) => {
                          const scenario = savedScenarios.find(
                            (s) => s.id === scenarioId
                          );
                          const tax = scenario
                            ? calculateTaxForScenario(scenario)
                            : null;
                          return (
                            <td key={scenarioId}>
                              £
                              {tax?.grossInterest.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }) || "0.00"}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td>
                          <strong>Tax-Free Interest (ISAs)</strong>
                        </td>
                        {selectedScenarios.map((scenarioId) => {
                          const scenario = savedScenarios.find(
                            (s) => s.id === scenarioId
                          );
                          const isaInterest = scenario
                            ? calculateISAInterestForScenario(scenario)
                            : 0;
                          return (
                            <td key={scenarioId}>
                              £
                              {isaInterest.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td>
                          <strong>Tax Owed</strong>
                        </td>
                        {selectedScenarios.map((scenarioId) => {
                          const scenario = savedScenarios.find(
                            (s) => s.id === scenarioId
                          );
                          const tax = scenario
                            ? calculateTaxForScenario(scenario)
                            : null;
                          return (
                            <td key={scenarioId}>
                              £
                              {tax?.taxOwed.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }) || "0.00"}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="total-row">
                        <td>
                          <strong>Total Net Interest</strong>
                        </td>
                        {selectedScenarios.map((scenarioId) => {
                          const scenario = savedScenarios.find(
                            (s) => s.id === scenarioId
                          );
                          const tax = scenario
                            ? calculateTaxForScenario(scenario)
                            : null;
                          const isaInterest = scenario
                            ? calculateISAInterestForScenario(scenario)
                            : 0;
                          const total = (tax?.netInterest || 0) + isaInterest;
                          return (
                            <td key={scenarioId}>
                              <strong>
                                £
                                {total.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </strong>
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td>
                          <strong>Effective Tax Rate</strong>
                        </td>
                        {selectedScenarios.map((scenarioId) => {
                          const scenario = savedScenarios.find(
                            (s) => s.id === scenarioId
                          );
                          const tax = scenario
                            ? calculateTaxForScenario(scenario)
                            : null;
                          const isaInterest = scenario
                            ? calculateISAInterestForScenario(scenario)
                            : 0;
                          const totalGross =
                            (tax?.grossInterest || 0) + isaInterest;
                          const effectiveRate =
                            totalGross > 0
                              ? ((tax?.taxOwed || 0) / totalGross) * 100
                              : 0;
                          return (
                            <td key={scenarioId}>
                              {effectiveRate.toFixed(2)}%
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
