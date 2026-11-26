import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { fireEvent, render } from "@testing-library/react-native";
import { DateField } from "../../../../features/reminders/components/DateField";
import { addDays, toDateKey } from "../../../../utils/date";

describe("DateField", () => {
	beforeEach(() => jest.clearAllMocks());

	it("seleciona os atalhos Hoje e Amanhã", () => {
		const onChange = jest.fn();
		const today = toDateKey(new Date());
		const { getByLabelText, getAllByText } = render(
			<DateField value={today} onChange={onChange} />,
		);
		expect(getAllByText("Hoje")).toHaveLength(2);
		fireEvent.press(getByLabelText("Amanhã"));
		expect(onChange).toHaveBeenCalledWith(toDateKey(addDays(new Date(), 1)));
	});

	it("abre o calendário e aplica a data escolhida", () => {
		const onChange = jest.fn();
		const { getByLabelText } = render(
			<DateField value={toDateKey(new Date())} onChange={onChange} />,
		);
		fireEvent.press(getByLabelText("Escolher data"));

		const options = (DateTimePickerAndroid.open as jest.Mock).mock.calls[0][0];
		expect(options.mode).toBe("date");
		options.onChange({ type: "set" }, new Date(2030, 4, 9));
		expect(onChange).toHaveBeenCalledWith("2030-05-09");

		options.onChange({ type: "dismissed" }, undefined);
		expect(onChange).toHaveBeenCalledTimes(1);
	});
});
