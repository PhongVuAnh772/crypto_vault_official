/* eslint-disable react-hooks/exhaustive-deps */
import moment from 'moment';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import GlobalUtils from 'src/core/utils/globalUtils';
import { fetchAboutUs, getAboutUs } from './aboutus.detail.slice';
import { PolicyType } from './aboutus.detail.type';
const useAboutUsDetail = () => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const dispatch = useAppDispatch();
    const {policyContent, loading} = useAppSelector(getAboutUs);

    useEffect(() => {
        if (!policyContent) {
            dispatch(fetchAboutUs());
        }
    }, []);

    const findMostRecentUpdatedAt = (data: PolicyType[]): string => {
        if (!data || data.length === 0) {
            return '';
        }
        let mostRecent = data[0];
        for (let i = 1; i < data.length; i++) {
            const currentItem = data[i];
            if (
                moment(currentItem.updatedAt).isAfter(
                    moment(mostRecent.updatedAt),
                )
            ) {
                mostRecent = currentItem;
            }
        }
        return moment(mostRecent.updatedAt).format('MMMM D, YYYY');
    };
    const lastUpdate = (): string => {
        let result = '';
        if (policyContent) {
            result = findMostRecentUpdatedAt(policyContent);
        }
        return result;
    };
    return {policyContent, loading,newUI, lastUpdate};
};

export default useAboutUsDetail;
